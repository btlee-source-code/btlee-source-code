import * as SecureStore from 'expo-secure-store';

import type { ThemeMode } from '@/config/theme';

const STORAGE_KEY = 'btlee_theme';

export async function loadPersistedTheme(): Promise<ThemeMode> {
  try {
    return (await SecureStore.getItemAsync(STORAGE_KEY)) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export async function persistTheme(mode: ThemeMode): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    // best-effort
  }
}
