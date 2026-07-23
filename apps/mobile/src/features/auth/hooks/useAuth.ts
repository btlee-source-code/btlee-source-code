import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

import { API_URL } from '@/config/env';
import { HttpError } from '@/shared/api/httpClient';
import { clearTokens, getRefreshToken, setTokens } from '@/shared/api/authStorage';
import { authActions } from '@/features/auth/store/auth.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { User } from '@/shared/types/user';
import { accountApi } from '@/features/account/api/account.api';
import { authApi, type GoogleAuthResponse, type RegisterInput } from '../api/auth.api';

// Required by expo-web-browser on web and harmless on native. It closes an
// OAuth popup that returns to this application.
WebBrowser.maybeCompleteAuthSession();

// Android may deliver the same deep link both to openAuthSessionAsync and to
// Expo Router. Dedupe the one-time exchange so both consumers share one result.
const googleExchangeRequests = new Map<string, Promise<GoogleAuthResponse>>();

function exchangeGoogleCodeOnce(code: string): Promise<GoogleAuthResponse> {
  const existing = googleExchangeRequests.get(code);
  if (existing) return existing;

  const request = authApi.exchangeGoogleCode(code).catch((error) => {
    googleExchangeRequests.delete(code);
    throw error;
  });
  googleExchangeRequests.set(code, request);
  void request.then(
    () => {
      setTimeout(() => {
        if (googleExchangeRequests.get(code) === request) googleExchangeRequests.delete(code);
      }, 15_000);
    },
    () => undefined
  );
  return request;
}

function readQueryString(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
}

async function completeLegacyGoogleExchange(
  accessToken: string,
  refreshToken: string,
  isNewUser: boolean
): Promise<GoogleAuthResponse> {
  await setTokens(accessToken, refreshToken);
  try {
    const user = await authApi.me();
    return { accessToken, refreshToken, user, isNewUser };
  } catch (error) {
    await clearTokens();
    throw error;
  }
}

/**
 * High-level auth actions (mirrors the web `useAuth`). Persists tokens to
 * SecureStore and keeps the user in Redux.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((s) => s.auth);

  const login = useCallback(
    async (identifier: string, password: string): Promise<User> => {
      const res = await authApi.login(identifier, password);
      await setTokens(res.accessToken, res.refreshToken);
      dispatch(authActions.setAuth(res.user));
      return res.user;
    },
    [dispatch]
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<User> => {
      const res = await authApi.register(input);
      await setTokens(res.accessToken, res.refreshToken);
      dispatch(authActions.setAuth(res.user));
      return res.user;
    },
    [dispatch]
  );

  const completeGoogleSignIn = useCallback(async (callbackUrl: string) => {
    const { queryParams } = Linking.parse(callbackUrl);
    const status = readQueryString(queryParams?.status);
    const code = readQueryString(queryParams?.code);
    if (status !== 'success') {
      throw new HttpError(readQueryString(queryParams?.reason) ?? 'failed', 400);
    }

    // Temporary backwards compatibility if the mobile update reaches a device
    // before the server deployment. The updated server returns only `code`.
    const legacyAccessToken = readQueryString(queryParams?.accessToken);
    const legacyRefreshToken = readQueryString(queryParams?.refreshToken);
    const result = code
      ? await exchangeGoogleCodeOnce(code)
      : legacyAccessToken && legacyRefreshToken
        ? await completeLegacyGoogleExchange(
            legacyAccessToken,
            legacyRefreshToken,
            readQueryString(queryParams?.onboarding) === '1'
          )
        : null;
    if (!result) throw new HttpError('failed', 400);

    await setTokens(result.accessToken, result.refreshToken);
    dispatch(authActions.setAuth(result.user));
    return { user: result.user, isNewUser: result.isNewUser };
  }, [dispatch]);

  /**
   * Google sign-in via the backend OAuth flow (reuses the web Google client).
   * The browser returns only a short-lived one-time code; the real session is
   * exchanged over HTTPS. Returns null if the user cancels.
   */
  const loginWithGoogle = useCallback(async (): Promise<{ user: User; isNewUser: boolean } | null> => {
    const returnUrl = Linking.createURL('oauth');
    const startUrl = `${API_URL}/auth/google?client=mobile&flow=code&returnUrl=${encodeURIComponent(returnUrl)}`;
    const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);
    if (result.type !== 'success' || !result.url) return null; // cancelled / dismissed

    return completeGoogleSignIn(result.url);
  }, [completeGoogleSignIn]);

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
    await clearTokens();
    dispatch(authActions.clearAuth());
  }, [dispatch]);

  /**
   * Permanently delete the account and all its data, then drop the local
   * session. The server wipes everything and invalidates the tokens, so we
   * just clear local storage + Redux afterwards (same teardown as logout).
   */
  const deleteAccount = useCallback(async (): Promise<void> => {
    await accountApi.deleteAccount();
    await clearTokens();
    dispatch(authActions.clearAuth());
  }, [dispatch]);

  const setUser = useCallback((u: User) => dispatch(authActions.setUser(u)), [dispatch]);

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    register,
    loginWithGoogle,
    completeGoogleSignIn,
    logout,
    deleteAccount,
    setUser,
  };
}
