import * as Sentry from '@sentry/react-native';

import { SENTRY_DSN } from '@/config/env';

/**
 * Sentry is active only in release builds that carry a DSN. In dev / Expo Go
 * there's no DSN, so we neither init nor wrap — which also avoids the
 * "Sentry.wrap was called before Sentry.init" dev warning (the wrap has nothing
 * to attach to when init is skipped).
 */
export const isSentryEnabled = Boolean(SENTRY_DSN) && !__DEV__;

/**
 * Crash + error reporting. No-op unless Sentry is enabled. Called once at module
 * load in the root layout, before the app renders, so early errors are captured.
 */
export function initSentry(): void {
  if (!isSentryEnabled) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    // A modest trace sample — enough for performance insight without overhead.
    tracesSampleRate: 0.2,
    // Don't attach IP/user identifiers by default (privacy).
    sendDefaultPii: false,
  });
}

export { Sentry };
