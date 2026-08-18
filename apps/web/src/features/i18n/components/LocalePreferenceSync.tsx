'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

import { usersApi } from '@/features/account/api/users.api';
import { authActions } from '@/features/auth/store/auth.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

/** Keeps server-created notifications aligned with the active web language. */
export function LocalePreferenceSync() {
  const locale = useLocale() as 'ar' | 'en';
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isHydrated = useAppSelector((state) => state.auth.isHydrated);

  useEffect(() => {
    if (!isHydrated || !user || user.preferredLanguage === locale) return;

    let active = true;
    void usersApi
      .updateMe({ preferredLanguage: locale })
      .then((updated) => {
        if (active) dispatch(authActions.setUser(updated));
      })
      .catch(() => {
        // Best effort. The next authenticated render will retry if needed.
      });

    return () => {
      active = false;
    };
  }, [dispatch, isHydrated, locale, user]);

  return null;
}
