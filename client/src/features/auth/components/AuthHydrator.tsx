'use client';
/**
 * On load, if we have a persisted user, re-fetch it from /users/me to confirm
 * the session (the httpOnly cookie is sent automatically) and refresh the
 * cached object. If the session is gone, the request 401s — the httpClient
 * tries a token refresh and, failing that, clears auth.
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { authActions } from '@/features/auth/store/auth.slice';
import { usersApi } from '@/features/account/api/users.api';

export function AuthHydrator() {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!isHydrated) return;
    // Only probe when we think we're logged in — anonymous visitors make no call.
    if (!user) return;
    usersApi
      .me()
      .then((u) => dispatch(authActions.setUser(u)))
      .catch(() => dispatch(authActions.clearAuth()));
    // We only want to probe once after rehydration; ignore later user changes
    // (which would otherwise re-trigger the call after setUser succeeds).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, dispatch]);

  return null;
}
