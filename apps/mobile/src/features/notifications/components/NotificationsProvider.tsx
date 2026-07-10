import { useEffect, type ReactNode } from 'react';

import { notificationsActions } from '@/features/notifications/store/notifications.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { notificationsApi } from '../api/notifications.api';

/**
 * Loads the unread-notifications count when the user becomes authenticated and
 * clears it on logout, so the header bell badge stays in sync app-wide. Mirrors
 * WishlistProvider. There is no server push/polling (matches the web) — the
 * count is refreshed here on auth change and on the notifications screen focus.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  useEffect(() => {
    let active = true;
    if (status === 'authenticated') {
      notificationsApi
        .unreadCount()
        .then((res) => {
          if (active) dispatch(notificationsActions.setUnreadCount(res.unreadCount));
        })
        .catch(() => {});
    } else if (status === 'guest') {
      dispatch(notificationsActions.clearUnread());
    }
    return () => {
      active = false;
    };
  }, [status, dispatch]);

  return <>{children}</>;
}
