import { useCallback } from 'react';

import { clearTokens, getRefreshToken, setTokens } from '@/shared/api/authStorage';
import { authActions } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { User } from '@/shared/types/user';
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

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
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
    logout,
    setUser,
  };
}
