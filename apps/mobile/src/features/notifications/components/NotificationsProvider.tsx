import { useRouter } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { notificationsActions } from '@/features/notifications/store/notifications.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { notificationsApi } from '../api/notifications.api';
import {
  isPushSupported,
  loadNotifications,
  registerPushTokenAsync,
  unregisterPushTokenAsync,
} from '../lib/push';

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

  // Foreground receipt bumps the badge; tapping a push deep-links. expo-notifications
  // is loaded lazily and only where push is supported, so in Expo Go these
  // listeners are simply never attached (no crash).
  useEffect(() => {
    if (!isPushSupported) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    loadNotifications().then((Notifications) => {
      if (cancelled) return;
      const received = Notifications.addNotificationReceivedListener(() => refreshUnread());
      const response = Notifications.addNotificationResponseReceivedListener((r) => {
        const data = r.notification.request.content.data as { link?: unknown } | undefined;
        const link =
          typeof data?.link === 'string' && data.link.startsWith('/') ? data.link : null;
        router.push(link ?? '/notifications');
      });
      cleanup = () => {
        received.remove();
        response.remove();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return <>{children}</>;
}
