import { useEffect, useState, type ReactNode } from 'react';

import { loadPersistedLocale, setRuntimeLocale } from '@/config/locale';
import { localeActions } from '@/features/i18n/store/locale.slice';
import { useAppDispatch } from '@/shared/store/hooks';

/**
 * Hydrates the persisted language before the app renders, so the first paint is
 * already in the right locale (no flash). Gates children until ready.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

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

  if (!ready) return null;
  return <>{children}</>;
}
