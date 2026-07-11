/**
 * Admin API — wraps /admin/* endpoints with a dedicated axios instance
 * that uses the admin store's token instead of the user store.
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL, HttpError } from '@/shared/api/httpClient';
import { store } from '@/shared/store';
import { adminAuthActions } from '@/features/admin/store/admin.slice';

// Dedicated instance for /admin/* — auth rides in the admin httpOnly cookies,
// so we just need withCredentials; no Authorization header is set in JS.
const adminAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAdminSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      await axios.post(`${API_URL}/admin/auth/refresh`, {}, { withCredentials: true });
      return true;
    } catch {
      store.dispatch(adminAuthActions.clearAuth());
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

adminAxios.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<{ message?: string }>) => {
    const config = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    if (error.response?.status === 401 && config && !config._retried) {
      config._retried = true;
      const refreshed = await refreshAdminSession();
      if (refreshed) {
        return adminAxios.request(config);
      }
    }
    throw new HttpError(
      error.response?.data?.message ?? error.message ?? 'Network error',
      error.response?.status ?? 0
    );
  }
);

interface Envelope<T> {
  status: 'success';
  data: T;
  meta?: { pagination?: PaginationMeta };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function unwrap<T>(p: Promise<{ data: Envelope<T> }>): Promise<T> {
  const r = await p;
  return r.data.data;
}

export const adminApi = {
  login: async (email: string, password: string) => {
    // withCredentials so the browser accepts the admin httpOnly cookies.
    const res = await axios.post<Envelope<{
      admin: { id: string; name: string; email: string };
    }>>(`${API_URL}/admin/auth/login`, { email, password }, { withCredentials: true });
    return res.data.data;
  },

  logout: () =>
    unwrap<{ message: string }>(adminAxios.post('/admin/auth/logout', {})),

  dashboard: () => unwrap<DashboardStats>(adminAxios.get('/admin/dashboard')),

  listProperties: (params: Record<string, string | number | undefined>) =>
    unwrap<unknown[]>(adminAxios.get('/admin/properties', { params })),

  // Paginated variant — returns the page's items plus pagination meta so the
  // admin panel can offer a "load more" button.
  listPropertiesPaged: async (params: Record<string, string | number | undefined>) => {
    const res = await adminAxios.get<Envelope<unknown[]>>('/admin/properties', { params });
    return { items: res.data.data, meta: res.data.meta?.pagination };
  },

  reviewProperty: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) =>
    unwrap<unknown>(
      adminAxios.post(`/admin/properties/${id}/review`, { status, rejectionReason })
    ),

  setFeatured: (id: string, isFeatured: boolean) =>
    unwrap<unknown>(
      adminAxios.post(`/admin/properties/${id}/featured`, { isFeatured })
    ),

  deleteProperty: (id: string) =>
    unwrap<{ message: string }>(adminAxios.delete(`/admin/properties/${id}`)),

  bulkDeleteProperties: (ids: string[]) =>
    unwrap<{ deletedCount: number }>(
      adminAxios.post('/admin/properties/bulk-delete', { ids })
    ),

  // ── Cars management (mirrors the property methods against /admin/cars) ──
  listCarsPaged: async (params: Record<string, string | number | undefined>) => {
    const res = await adminAxios.get<Envelope<unknown[]>>('/admin/cars', { params });
    return { items: res.data.data, meta: res.data.meta?.pagination };
  },

  reviewCar: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) =>
    unwrap<unknown>(adminAxios.post(`/admin/cars/${id}/review`, { status, rejectionReason })),

  setCarFeatured: (id: string, isFeatured: boolean) =>
    unwrap<unknown>(adminAxios.post(`/admin/cars/${id}/featured`, { isFeatured })),

  deleteCar: (id: string) =>
    unwrap<{ message: string }>(adminAxios.delete(`/admin/cars/${id}`)),

  bulkDeleteCars: (ids: string[]) =>
    unwrap<{ deletedCount: number }>(adminAxios.post('/admin/cars/bulk-delete', { ids })),

  listUsers: () => unwrap<UserAdmin[]>(adminAxios.get('/admin/users')),

  blockUser: (userId: string, isBlocked: boolean) =>
    unwrap<unknown>(adminAxios.post(`/admin/users/${userId}/block`, { isBlocked })),

  listReports: (status?: 'open' | 'reviewed' | 'dismissed') =>
    unwrap<ReportAdmin[]>(
      adminAxios.get('/admin/reports', { params: status ? { status } : undefined })
    ),

  updateReport: (id: string, status: 'reviewed' | 'dismissed') =>
    unwrap<unknown>(adminAxios.patch(`/admin/reports/${id}`, { status })),
};

export interface DashboardStats {
  users: { total: number; blocked: number };
  properties: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    sold: number;
    rented: number;
    featured: number;
  };
  cars: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    sold: number;
    rented: number;
    featured: number;
  };
  reports: { open: number };
}

export interface UserAdmin {
  _id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isBlocked: boolean;
  createdAt: string;
}

export interface ReportAdmin {
  _id: string;
  property: { _id: string; area_name: string; governorate: string; images: { url: string }[] };
  reporter: { _id: string; name: string; email: string };
  reason: string;
  details: string | null;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: string;
}
