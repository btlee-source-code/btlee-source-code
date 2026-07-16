import { Platform } from 'react-native';

/** Live API — the safe default for any RELEASE build (preview/production). */
const PRODUCTION_API_URL = 'https://btlee-api.up.railway.app/api';

/**
 * Resolves the backend API base URL for the current runtime.
 *
 * Precedence:
 *   1. EXPO_PUBLIC_API_URL — injected at bundle time (from .env / eas.json /
 *      EAS env). This is how builds normally point at the live API, and how you
 *      override to a LAN IP when testing on a real device.
 *   2. Fallback when the var is missing:
 *      - In local dev (Metro, __DEV__) → the local dev server (10.0.2.2 for the
 *        Android emulator, localhost otherwise). The dev server runs on :5000.
 *      - In a RELEASE build (__DEV__ === false) → PRODUCTION. Never localhost —
 *        so a missing/failed env injection can't ship an app that silently talks
 *        to a dead local address (that was the "server not working on the APK"
 *        bug: the app fell back to localhost, unreachable from a real device).
 */
const DEV_FALLBACK =
  Platform.select({
    android: 'http://10.0.2.2:5000/api',
    default: 'http://localhost:5000/api',
  }) ?? 'http://localhost:5000/api';

const FALLBACK = __DEV__ ? DEV_FALLBACK : PRODUCTION_API_URL;

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? FALLBACK;

/**
 * Public web-site base URL — used to build canonical share links
 * (`${WEB_URL}/properties/{id}`), since the app itself has no public URL. The
 * web uses next-intl `localePrefix: 'always'`, so a bare `/properties/{id}`
 * redirects to `/ar/properties/{id}` server-side.
 */
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://www.btlee-eg.com';

/**
 * Sentry DSN (crash + error reporting). A client DSN is not secret — it only
 * accepts events, it can't read them — so it's safe to inline via EXPO_PUBLIC_*.
 * Empty in local dev → reporting stays off until set for release builds.
 */
export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export const IS_DEV = __DEV__;
