import { useEffect, type ReactNode } from 'react';

import { clearTokens, getAccessToken } from '@/shared/api/authStorage';
import { authActions } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { authApi } from '../api/auth.api';

/**
 * Hydrates auth state on app start: if a token is stored, fetch the current user
 * (the source of truth). A 401 triggers the httpClient refresh flow; if that
 * also fails the interceptor clears the tokens and we fall back to guest.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        if (active) dispatch(authActions.setGuest());
        return;
      }
      try {
        const user = await authApi.me();
        if (active) dispatch(authActions.setAuth(user));
      } catch {
        await clearTokens();
        if (active) dispatch(authActions.setGuest());
      }
    })();
    return () => {
      active = false;
    };
  }, [dispatch]);

  return <>{children}</>;
}
