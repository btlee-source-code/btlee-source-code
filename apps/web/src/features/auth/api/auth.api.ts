/**
 * Auth API — wraps the /auth endpoints.
 * Tokens are set/cleared by the server as httpOnly cookies; responses carry
 * only the user object. `skipAuth: true` tells the interceptor not to attempt
 * a refresh-and-retry (a 401 here means bad credentials, not an expired session).
 */
import { http } from '@/shared/api/httpClient';
import type { AuthResult } from '@/shared/types/user';

export const authApi = {
  register: (input: { name: string; email: string; phone: string; password: string }) =>
    http.post<AuthResult>('/auth/register', input, { skipAuth: true }),

  login: (input: { identifier: string; password: string }) =>
    http.post<AuthResult>('/auth/login', input, { skipAuth: true }),

  logout: () => http.post<{ message: string }>('/auth/logout', {}),

  forgotPassword: (email: string) =>
    http.post<{ message: string }>('/auth/forgot-password', { email }, { skipAuth: true }),

  resetPassword: (token: string, password: string) =>
    http.post<{ message: string }>(
      '/auth/reset-password',
      { token, password },
      { skipAuth: true }
    ),
};
