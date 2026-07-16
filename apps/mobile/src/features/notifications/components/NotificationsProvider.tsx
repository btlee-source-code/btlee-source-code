import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect, type ReactNode } from 'react';

import { notificationsActions } from '@/features/notifications/store/notifications.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { notificationsApi } from '../api/notifications.api';
import { registerPushTokenAsync, unregisterPushTokenAsync } from '../lib/push';

/**
 * Keeps the header bell badge in sync and wires device push:
 *  - refreshes the unread count when the user becomes authenticated (and on push
 *    receipt), clears it on logout;
 *  - registers this device's Expo push token on login, unregisters on logout;
 *  - on tapping a push, deep-links to the linked screen (or the notifications
 *    list). Mounted once, app-wide.
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

  // Foreground receipt bumps the badge; tapping a push deep-links.
  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(() => refreshUnread());
    const response = Notifications.addNotificationResponseReceivedListener((r) => {
      const data = r.notification.request.content.data as { link?: unknown } | undefined;
      const link = typeof data?.link === 'string' && data.link.startsWith('/') ? data.link : null;
      router.push(link ?? '/notifications');
    });
    return () => {
      received.remove();
      response.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return <>{children}</>;
}
