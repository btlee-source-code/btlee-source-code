/**
 * HTTP client (axios) — wraps every API call with:
 *   - cookie-based auth (httpOnly cookies sent automatically via withCredentials;
 *     no tokens are ever read or held in JS)
 *   - automatic session refresh on 401, then a single retry
 *   - a `data`-unwrapped return for the standardized success envelope
 *
 * The exported `http` object has typed get/post/patch/put/delete helpers
 * so callers don't have to remember axios's `data.data` chain.
 */
import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { store } from '@/shared/store';
import { authActions } from '@/features/auth/store/auth.slice';

// In production NEXT_PUBLIC_API_URL must point at the deployed API origin.
// If it's missing the build would silently fall back to localhost — fail
// loudly instead so the misconfiguration is caught immediately.
if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.error(
    '[btlee] NEXT_PUBLIC_API_URL is not set — set it to your API origin ' +
      '(e.g. https://your-api.up.railway.app/api) before deploying.'
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  // Always send/receive the httpOnly auth cookies.
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

interface RequestConfigWithSkipAuth extends AxiosRequestConfig {
  // Skip the automatic refresh-and-retry on 401 (e.g. for login/register,
  // where a 401 is a genuine "bad credentials" answer, not an expired session).
  skipAuth?: boolean;
  _retried?: boolean;
}

// Session refresh — the refresh token rides along in its httpOnly cookie, so
// there's nothing to send in the body. On success the server sets fresh cookies.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      return true;
    } catch {
      store.dispatch(authActions.clearAuth());
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

// On 401 → refresh + retry once
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; details?: unknown }>) => {
    const config = error.config as (RequestConfigWithSkipAuth & InternalAxiosRequestConfig) | undefined;

    if (
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !config.skipAuth
    ) {
      config._retried = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        return axiosInstance.request(config);
      }
    }

    const message =
      error.response?.data?.message ?? error.message ?? 'Network error';
    throw new HttpError(message, error.response?.status ?? 0, error.response?.data?.details);
  }
);

// ============================================================
// Typed helpers — unwrap the { status, data } envelope
// ============================================================

interface ApiEnvelope<T> {
  status: 'success';
  data: T;
  meta?: Record<string, unknown>;
}

async function get<T>(path: string, config?: RequestConfigWithSkipAuth): Promise<T> {
  const res = await axiosInstance.get<ApiEnvelope<T>>(path, config);
  return res.data.data;
}

// Like get(), but also returns the envelope's `meta` (e.g. pagination) for
// callers that need the total count, not just the current page of items.
async function getWithMeta<T>(
  path: string,
  config?: RequestConfigWithSkipAuth
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const res = await axiosInstance.get<ApiEnvelope<T>>(path, config);
  return { data: res.data.data, meta: res.data.meta };
}

async function post<T>(
  path: string,
  body?: unknown,
  config?: RequestConfigWithSkipAuth
): Promise<T> {
  const res = await axiosInstance.post<ApiEnvelope<T>>(path, body, config);
  return res.data.data;
}

async function patch<T>(
  path: string,
  body?: unknown,
  config?: RequestConfigWithSkipAuth
): Promise<T> {
  const res = await axiosInstance.patch<ApiEnvelope<T>>(path, body, config);
  return res.data.data;
}

async function put<T>(
  path: string,
  body?: unknown,
  config?: RequestConfigWithSkipAuth
): Promise<T> {
  const res = await axiosInstance.put<ApiEnvelope<T>>(path, body, config);
  return res.data.data;
}

async function del<T>(path: string, config?: RequestConfigWithSkipAuth): Promise<T> {
  const res = await axiosInstance.delete<ApiEnvelope<T>>(path, config);
  return res.data.data;
}

export const http = { get, getWithMeta, post, patch, put, delete: del };
export { API_URL, axiosInstance };
