import { Platform } from 'react-native';

/**
 * Resolves the backend API base URL for the current runtime.
 *
 * Precedence:
 *   1. EXPO_PUBLIC_API_URL — set this when testing on a REAL device (use your
 *      laptop's LAN IP, e.g. http://192.168.1.16:5000/api). Also how production
 *      builds point at the live API.
 *   2. Android emulator → 10.0.2.2 is the host-loopback alias (the emulator's
 *      own "localhost" is the emulator itself, not your laptop).
 *   3. iOS simulator / web → localhost reaches the laptop directly.
 *
 * The local dev server runs on http://localhost:5000 (see apps/server).
 */
const DEV_FALLBACK =
  Platform.select({
    android: 'http://10.0.2.2:5000/api',
    default: 'http://localhost:5000/api',
  }) ?? 'http://localhost:5000/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEV_FALLBACK;

export const IS_DEV = __DEV__;
