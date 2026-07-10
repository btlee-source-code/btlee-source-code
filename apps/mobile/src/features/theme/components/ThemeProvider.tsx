import { colorScheme } from 'nativewind';
import { useEffect, useState, type ReactNode } from 'react';

import { themeActions } from '@/features/theme/store/theme.slice';
import { loadPersistedTheme } from '@/features/theme/lib/themeStorage';
import { useAppDispatch } from '@/shared/store/hooks';

/** Hydrates the persisted theme before first paint (no flash), then gates in. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadPersistedTheme().then((mode) => {
      if (!active) return;
      colorScheme.set(mode); // apply before children render (no flash)
      dispatch(themeActions.setMode(mode));
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [dispatch]);

  if (!ready) return null;
  return <>{children}</>;
}
