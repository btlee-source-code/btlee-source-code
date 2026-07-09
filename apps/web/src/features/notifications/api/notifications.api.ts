/**
 * Notifications API client
 */
import { http } from '@/shared/api/httpClient';
import type { Notification } from '@/shared/types/api';

export const notificationsApi = {
  list: () => http.get<Notification[]>('/notifications'),
  unreadCount: () => http.get<{ unreadCount: number }>('/notifications/unread-count'),
  markRead: (id: string) => http.post(`/notifications/${id}/read`),
  markAllRead: () => http.post('/notifications/read-all'),
};
