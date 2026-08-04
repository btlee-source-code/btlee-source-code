import { useRouter } from 'expo-router';
import type { NotificationResponse } from 'expo-notifications';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { notificationsActions } from '@/features/notifications/store/notifications.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { notificationsApi } from '../api/notifications.api';
import {
  isPushSupported,
  loadNotifications,
  registerPushTokenAsync,
  syncPushTokenAsync,
  unregisterPushTokenAsync,
} from '../lib/push';
import { getNotificationRoute } from '../lib/notificationRoutes';

/**
 * Keeps the header bell badge in sync and wires device push:
 *  - refreshes the unread count when the user becomes authenticated (and on push
 *    receipt), clears it on logout;
 *  - registers this device's Expo push token on login, unregisters on logout;
 *  - on tapping a push, deep-links to the linked screen (or the notifications
 *    list). Mounted once, app-wide.
 *
 * Push is unavailable in Expo Go (see lib/push), so the token registration and
 * the notification listeners are skipped there — the badge sync still works.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((s) => s.auth.status);

  const refreshUnread = () => {
    notificationsApi
      .unreadCount()
      .then((res) => dispatch(notificationsActions.setUnreadCount(res.unreadCount)))
      .catch(() => {});
  };

  // Unread count + push-token lifecycle on auth change.
  useEffect(() => {
    if (status === 'authenticated') {
      refreshUnread();
      void registerPushTokenAsync();
    } else if (status === 'guest') {
      dispatch(notificationsActions.clearUnread());
      void unregisterPushTokenAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, dispatch]);

  // Retry device registration/removal whenever the app becomes active. This
  // repairs transient offline failures and, for guests, removes a token that
  // could not be detached during logout.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      if (status === 'authenticated') void registerPushTokenAsync();
      if (status === 'guest') void unregisterPushTokenAsync();
    });
    return () => subscription.remove();
  }, [status]);

  // Foreground receipt bumps the badge; tapping a push deep-links. expo-notifications
  // is loaded lazily and only where push is supported, so in Expo Go these
  // listeners are simply never attached (no crash).
  useEffect(() => {
    if (!isPushSupported) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void loadNotifications().then(async (Notifications) => {
      if (cancelled) return;
      const received = Notifications.addNotificationReceivedListener(() => refreshUnread());
      const openNotification = (r: NotificationResponse) => {
        const data = r.notification.request.content.data as { link?: unknown } | undefined;
        const route = getNotificationRoute(data?.link);
        router.push((route ?? '/notifications') as never);
      };
      const response = Notifications.addNotificationResponseReceivedListener(openNotification);
      const tokenChanged = Notifications.addPushTokenListener((token) => {
        void syncPushTokenAsync(token.data).catch((error) => {
          console.warn('[push] rotated token registration failed', error);
        });
      });
      cleanup = () => {
        received.remove();
        response.remove();
        tokenChanged.remove();
      };

      // A response can predate listener registration when a notification starts
      // a fully terminated app. Consume it once, then clear it to prevent the
      // same deep link from reopening on later normal launches.
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (!cancelled && lastResponse) {
        openNotification(lastResponse);
        await Notifications.clearLastNotificationResponseAsync();
      }
    }).catch((error) => {
      console.warn('[push] notification listeners failed to initialize', error);
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return <>{children}</>;
}
