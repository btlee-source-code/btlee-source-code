import { colorScheme } from 'nativewind';
import { useCallback } from 'react';

import { THEME_COLORS, type ThemeColors, type ThemeMode } from '@/config/theme';
import { themeActions } from '@/features/theme/store/theme.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { persistTheme } from '../lib/themeStorage';

/** Read + set the active theme. Drives NativeWind's color scheme + persists. */
export function useTheme() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  const setMode = useCallback(
    (next: ThemeMode) => {
      colorScheme.set(next); // flips every NativeWind color globally
      dispatch(themeActions.setMode(next));
      void persistTheme(next);
    },
    [dispatch]
  );

  const toggle = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode]);

  return { mode, isDark: mode === 'dark', setMode, toggle };
}

/**
 * Raw hex colors for the active theme — for imperative `color=` props (icons).
 * Keyed by BOTH the light/dark mode and the active section, so the brand colors
 * (primary / accent) follow the current section (properties | cars).
 */
export function useThemeColors(): ThemeColors {
  const mode = useAppSelector((s) => s.theme.mode);
  const section = useAppSelector((s) => s.section.section);
  return THEME_COLORS[section][mode];
}
