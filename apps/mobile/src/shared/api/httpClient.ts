/**
 * Shared axios client — mirrors the web `httpClient.ts` (same success envelope
 * `{ status, data, meta }` and `HttpError` shape), adapted for mobile:
 *   - Bearer token from SecureStore (web uses httpOnly cookies).
 *   - `X-Client: mobile` header so the backend can return tokens in the JSON
 *     body (additive change) without affecting the cookie-based web flow.
 *   - Refresh-on-401 with in-flight dedupe (fully exercised once auth lands).
 */
import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { API_URL } from '@/config/env';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './authStorage';

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

/** Extra per-request flags we set on the axios config. */
export interface RequestConfig extends AxiosRequestConfig {
  /** Skip Bearer header + skip refresh-on-401 (login/register/forgot/reset). */
  skipAuth?: boolean;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
  skipAuth?: boolean;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { Accept: 'application/json', 'X-Client': 'mobile' },
});

// Attach the access token (unless the call opted out).
api.interceptors.request.use(async (config) => {
  const cfg = config as RetryConfig;
  if (!cfg.skipAuth) {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// De-duped refresh: concurrent 401s share a single /auth/refresh call.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) return false;
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'X-Client': 'mobile' } }
        );
        const data = res.data?.data ?? {};
        if (data.accessToken) {
          await setTokens(data.accessToken, data.refreshToken ?? refreshToken);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    })();

    refreshInFlight.finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string; details?: unknown }>) => {
    const cfg = error.config as RetryConfig | undefined;
    const status = error.response?.status ?? 0;

    if (status === 401 && cfg && !cfg._retried && !cfg.skipAuth) {
      cfg._retried = true;
      const ok = await refreshSession();
      if (ok) return api.request(cfg);
      await clearTokens();
    }

    const message = error.response?.data?.message ?? error.message ?? 'Network error';
    const details = error.response?.data?.details;
    return Promise.reject(new HttpError(message, status, details));
  }
);

// Helpers unwrap the `{ status, data, meta }` envelope, like the web client.
export async function get<T>(url: string, config?: RequestConfig): Promise<T> {
  const res = await api.get(url, config);
  return res.data.data as T;
}

export async function getWithMeta<T, M = unknown>(
  url: string,
  config?: RequestConfig
): Promise<{ data: T; meta: M }> {
  const res = await api.get(url, config);
  return { data: res.data.data as T, meta: res.data.meta as M };
}

export async function post<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
  const res = await api.post(url, body, config);
  return res.data.data as T;
}

export async function patch<T>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
  const res = await api.patch(url, body, config);
  return res.data.data as T;
}

export async function del<T>(url: string, config?: RequestConfig): Promise<T> {
  const res = await api.delete(url, config);
  return res.data.data as T;
}
