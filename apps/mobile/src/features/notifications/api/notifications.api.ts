import { del, get, getWithMeta, post } from '@/shared/api/httpClient';
import type { Notification } from '@/shared/types/notification';

/**
 * Notifications API — mirrors the web client (apps/web/src/features/notifications).
 * All endpoints require auth (Bearer attached automatically by the interceptor).
 * The server hard-caps the list at 30 and returns the unread count in `meta`,
 * so `list()` fills both the screen and the badge in a single request.
 */
export const notificationsApi = {
  list: () => getWithMeta<Notification[], { unreadCount: number }>('/notifications'),
  unreadCount: () => get<{ unreadCount: number }>('/notifications/unread-count'),
  markRead: (id: string) => post<{ message: string }>(`/notifications/${id}/read`),
  markAllRead: () => post<{ message: string }>('/notifications/read-all'),
  registerPushToken: (token: string) =>
    post<{ message: string }>('/notifications/push-token', { token }),
  unregisterPushToken: (token: string) =>
    del<{ message: string }>('/notifications/push-token', { data: { token } }),
};
