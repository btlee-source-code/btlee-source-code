import * as SecureStore from 'expo-secure-store';

/**
 * Locale runtime — the single source of truth for the active language.
 *
 * The app is Arabic-first (matches the web, which ignores Accept-Language and
 * defaults to 'ar'). The active locale lives in module state so the `S` strings
 * object and the enum label maps can read it synchronously at render time
 * without threading a hook through every call site. On switch we persist the
 * choice and remount the navigator (see the root layout) so every screen
 * re-reads the strings — English falls back to Arabic for any missing key, so
 * the UI is never broken, only partially translated.
 */
export type Locale = 'ar' | 'en';

const STORAGE_KEY = 'btlee_locale';
let current: Locale = 'ar';

export function getLocale(): Locale {
  return current;
}

export function setRuntimeLocale(locale: Locale): void {
  current = locale;
}

export async function loadPersistedLocale(): Promise<Locale> {
  try {
    return (await SecureStore.getItemAsync(STORAGE_KEY)) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export async function persistLocale(locale: Locale): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, locale);
  } catch {
    // best-effort; falls back to default on next launch
  }
}

/** Locale-aware label map — returns the English value when active, else Arabic. */
export function localeMap<K extends string>(ar: Record<K, string>, en: Record<K, string>): Record<K, string> {
  const arMap = ar as Record<string, string>;
  const enMap = en as Record<string, string>;
  return new Proxy(arMap, {
    get: (target, key: string) => (current === 'en' ? (enMap[key] ?? target[key]) : target[key]),
  }) as Record<K, string>;
}
