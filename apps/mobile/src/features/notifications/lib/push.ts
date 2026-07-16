import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { notificationsApi } from '../api/notifications.api';

/**
 * Push-notification device wiring (Expo push → FCM/APNs).
 *
 * The backend stores the Expo push token per user and sends through Expo's push
 * service whenever it creates an in-app notification, so this file only handles
 * the device end: foreground presentation, permission + token, and register /
 * unregister with the backend on login / logout.
 *
 * ⚠️ Expo Go: the remote-push native module was removed from Expo Go in SDK 53,
 * so importing/using `expo-notifications` there throws and crashes the app. We
 * therefore (a) never import it statically, (b) short-circuit all push work when
 * running inside Expo Go, and (c) load it dynamically only in dev/production
 * builds — where push actually works. Devs can keep using Expo Go; push simply
 * no-ops there.
 */

/** False inside Expo Go (`storeClient`), true in a dev/production build. */
export const isPushSupported = Constants.executionEnvironment !== 'storeClient';

const projectId: string | undefined =
  (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
  Constants.easConfig?.projectId;

// Remember the device token so we can unregister exactly it on logout.
let cachedToken: string | null = null;
let handlerConfigured = false;

/**
 * Dynamically import expo-notifications and configure the foreground handler
 * once. Callers MUST guard on `isPushSupported` before calling this — it is
 * never safe to touch expo-notifications inside Expo Go.
 */
export async function loadNotifications() {
  const Notifications = await import('expo-notifications');
  if (!handlerConfigured) {
    // How notifications look while the app is in the FOREGROUND.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    handlerConfigured = true;
  }
  return Notifications;
}

/**
 * Request permission, get the Expo push token, and register it with the backend.
 * Idempotent — safe to call on every login. No-ops in Expo Go, on simulators, or
 * when the user denies permission. Returns the token, or null.
 */
export async function registerPushTokenAsync(): Promise<string | null> {
  if (!isPushSupported || !Device.isDevice) return null;

  const Notifications = await loadNotifications();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'الإشعارات',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A3C34',
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted;
  }
  if (!granted) return null;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    cachedToken = token;
    await notificationsApi.registerPushToken(token);
    return token;
  } catch (err) {
    console.warn('[push] token registration failed', err);
    return null;
  }
}

/** Detach this device's token from the account (called on logout). */
export async function unregisterPushTokenAsync(): Promise<void> {
  if (!cachedToken) return;
  const token = cachedToken;
  cachedToken = null;
  try {
    await notificationsApi.unregisterPushToken(token);
  } catch {
    // Logout must proceed regardless of network.
  }
}
