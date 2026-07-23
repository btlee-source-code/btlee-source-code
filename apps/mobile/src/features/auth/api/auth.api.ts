import { get, post } from '@/shared/api/httpClient';
import type { User } from '@/shared/types/user';

/** Auth responses carry the tokens in the body (backend sends them for X-Client: mobile). */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const authApi = {
  register: (body: RegisterInput) =>
    post<AuthResponse>('/auth/register', body, { skipAuth: true }),

  login: (identifier: string, password: string) =>
    post<AuthResponse>('/auth/login', { identifier, password }, { skipAuth: true }),

  exchangeGoogleCode: (code: string) =>
    post<GoogleAuthResponse>('/auth/google/mobile-exchange', { code }, { skipAuth: true }),

  logout: (refreshToken: string) => post<{ message: string }>('/auth/logout', { refreshToken }),

  me: () => get<User>('/users/me'),

  forgotPassword: (email: string) =>
    post<{ message: string }>('/auth/forgot-password', { email }, { skipAuth: true }),

  resetPassword: (token: string, password: string) =>
    post<{ message: string }>('/auth/reset-password', { token, password }, { skipAuth: true }),
};
