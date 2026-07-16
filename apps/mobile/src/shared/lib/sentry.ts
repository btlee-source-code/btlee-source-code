import * as Sentry from '@sentry/react-native';

import { SENTRY_DSN } from '@/config/env';

/**
 * Crash + error reporting. No-op unless a DSN is configured (EXPO_PUBLIC_SENTRY_DSN),
 * and it only actually sends from release builds — dev crashes surface in Metro,
 * so we don't pollute Sentry with them. Called once at module load in the root
 * layout, before the app renders, so early errors are captured.
 */
export function initSentry(): void {
  if (!SENTRY_DSN) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: !__DEV__,
    // A modest trace sample — enough for performance insight without overhead.
    tracesSampleRate: 0.2,
    // Don't attach IP/user identifiers by default (privacy).
    sendDefaultPii: false,
  });
}

export { Sentry };
