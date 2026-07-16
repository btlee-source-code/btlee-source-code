import { del, patch, post } from '@/shared/api/httpClient';
import type { User, UserGoal } from '@/shared/types/user';

/**
 * Account API — mirrors the web `users.api.ts`. All auth-gated.
 *
 * NOTE: `changePassword` revokes every session server-side and returns fresh
 * tokens as httpOnly cookies only (it does NOT honor X-Client:mobile), so the
 * mobile refresh token is dead afterwards — the caller must force a re-login.
 */
export const accountApi = {
  updateMe: (body: { name?: string; avatar?: string | null }) => patch<User>('/users/me', body),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<{ message: string }>('/users/me/change-password', { currentPassword, newPassword }),
  completeOnboarding: (goal: UserGoal) => post<User>('/users/me/onboarding', { goal }),
  /** Permanently delete the account and all associated data. Irreversible. */
  deleteAccount: () => del<{ message: string }>('/users/me'),
};
