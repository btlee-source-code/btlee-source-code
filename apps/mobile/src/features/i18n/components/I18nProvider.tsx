import { useEffect, useState, type ReactNode } from 'react';

import { loadPersistedLocale, setRuntimeLocale } from '@/config/locale';
import { accountApi } from '@/features/account/api/account.api';
import { authActions } from '@/features/auth/store/auth.slice';
import { localeActions } from '@/features/i18n/store/locale.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

/**
 * Hydrates the persisted language before the app renders, so the first paint is
 * already in the right locale (no flash). Gates children until ready.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const locale = useAppSelector((state) => state.locale.locale);
  const user = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    let active = true;
    loadPersistedLocale().then((locale) => {
      if (!active) return;
      setRuntimeLocale(locale);
      dispatch(localeActions.setLocale(locale));
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!ready || authStatus !== 'authenticated' || !user || user.preferredLanguage === locale) {
      return;
    }

    let active = true;
    void accountApi
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
  }, [authStatus, dispatch, locale, ready, user]);

  if (!ready) return null;
  return <>{children}</>;
}
