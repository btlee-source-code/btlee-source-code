/**
 * Users API client
 */
import { http } from '@/shared/api/httpClient';
import type { User } from '@/shared/types/user';

export const usersApi = {
  me: () => http.get<User>('/users/me'),
  updateMe: (input: { name?: string; avatar?: string | null }) =>
    http.patch<User>('/users/me', input),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.post('/users/me/change-password', { currentPassword, newPassword }),
  completeOnboarding: (goal: string) =>
    http.post<User>('/users/me/onboarding', { goal }),
  publicOwner: (userId: string) =>
    http.get<{ id: string; name: string; avatar: string | null; createdAt: string }>(
      `/users/${userId}/public`
    ),
};

