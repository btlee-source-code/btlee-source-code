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
import { authApi, type RegisterInput } from '../api/auth.api';

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

  /**
   * Google sign-in via the backend OAuth flow (reuses the web Google client).
   * Opens the consent screen in an in-app browser; the backend hands the tokens
   * back through the app deep link. Returns null if the user cancels.
   */
  const loginWithGoogle = useCallback(async (): Promise<{ user: User; isNewUser: boolean } | null> => {
    const returnUrl = Linking.createURL('oauth');
    const startUrl = `${API_URL}/auth/google?client=mobile&returnUrl=${encodeURIComponent(returnUrl)}`;
    const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);
    if (result.type !== 'success' || !result.url) return null; // cancelled / dismissed

    const { queryParams } = Linking.parse(result.url);
    const accessToken = queryParams?.accessToken;
    const refreshToken = queryParams?.refreshToken;
    if (queryParams?.status !== 'success' || typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      throw new HttpError(typeof queryParams?.reason === 'string' ? queryParams.reason : 'failed', 400);
    }

    await setTokens(accessToken, refreshToken);
    const user = await authApi.me();
    dispatch(authActions.setAuth(user));
    return { user, isNewUser: queryParams?.onboarding === '1' };
  }, [dispatch]);

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
    logout,
    deleteAccount,
    setUser,
  };
}
