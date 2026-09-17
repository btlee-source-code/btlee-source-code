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
import { HttpError } from '@/shared/api/httpClient';

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
      .catch((err: unknown) => {
        // Only a genuine 401 (the httpClient already tried a refresh) means the
        // session is really gone. A network failure or a 5xx/404 from a proxy
        // must NOT sign the user out — that turns any backend blip into a
        // silent logout on every reload.
        if (err instanceof HttpError && err.status === 401) {
          dispatch(authActions.clearAuth());
        }
      });
    // We only want to probe once after rehydration; ignore later user changes
    // (which would otherwise re-trigger the call after setUser succeeds).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, dispatch]);

  return null;
}
