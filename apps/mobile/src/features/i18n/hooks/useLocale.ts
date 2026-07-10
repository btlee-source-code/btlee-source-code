import { useCallback } from 'react';

import { persistLocale, setRuntimeLocale, type Locale } from '@/config/locale';
import { localeActions } from '@/features/i18n/store/locale.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

/**
 * Reads/sets the active language. Switching updates the module-level locale
 * synchronously (so strings read fresh), persists the choice, and dispatches to
 * Redux — which remounts the navigator (keyed by locale) so every screen
 * re-renders in the new language.
 */
export function useLocale() {
  const dispatch = useAppDispatch();
  const locale = useAppSelector((s) => s.locale.locale);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      setRuntimeLocale(next);
      dispatch(localeActions.setLocale(next));
      void persistLocale(next);
    },
    [locale, dispatch]
  );

  return { locale, setLocale };
}
