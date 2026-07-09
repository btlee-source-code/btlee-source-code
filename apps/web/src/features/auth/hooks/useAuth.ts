/**
 * useAuth — high-level hook combining state + actions.
 * Auth tokens live in httpOnly cookies; this hook only tracks the user object.
 *
 * Internals run on Redux Toolkit; the public API is unchanged from the
 * previous Zustand implementation so consuming components don't notice.
 */
'use client';

import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { authActions } from '@/features/auth/store/auth.slice';
import { authApi } from '../api/auth.api';
import { useRouter } from '@/config/navigation';

export function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);

  async function login(identifier: string, password: string) {
    const result = await authApi.login({ identifier, password });
    dispatch(authActions.setAuth(result.user));
    return result;
  }

  async function register(name: string, email: string, phone: string, password: string) {
    const result = await authApi.register({ name, email, phone, password });
    dispatch(authActions.setAuth(result.user));
    return result;
  }

  async function logout() {
    // Clears the auth cookies server-side; ignore network errors on the way out.
    await authApi.logout().catch(() => {});
    dispatch(authActions.clearAuth());
    router.push('/');
  }

  function setUser(updated: Parameters<typeof authActions.setUser>[0]) {
    dispatch(authActions.setUser(updated));
  }

  return {
    user,
    isAuthenticated: Boolean(user),
    isHydrated,
    login,
    register,
    logout,
    setUser,
  };
}
