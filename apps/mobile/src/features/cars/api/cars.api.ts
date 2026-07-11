/**
 * Cars API — thin wrappers over the shared http client, mirroring
 * `properties.api.ts`. All list/detail/featured/latest endpoints are PUBLIC
 * (no auth needed); create/update/delete/mark are owner-gated.
 */
import { del, get, getWithMeta, patch, post } from '@/shared/api/httpClient';
import type { Car, CarImage } from '@/shared/types/car';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CarQuery {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  search?: string;
  listingType?: string;
  condition?: string;
  make?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  governorate?: string;
}

/** Drop empty params so the backend applies its defaults (matches web buildQuery). */
function cleanParams(q: CarQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v as string | number;
  }
  return out;
}

/** Body for creating/updating a car listing (mirrors the server createCarSchema). */
export interface CarInput {
  listingType: string;
  condition: string;
  make: string;
  model: string;
  year: number;
  mileage?: number | null;
  transmission: string;
  fuelType: string;
  bodyType: string;
  color?: string | null;
  price?: number | null;
  governorate: string;
  area_name: string;
  coordinates?: [number, number]; // [lng, lat]
  description: string;
  images: CarImage[];
  whatsappNumber: string;
  durationDays: number;
}

export const carsApi = {
  /** Paginated list — returns `{ data, meta.pagination }`. */
  list: (q: CarQuery = {}) =>
    getWithMeta<Car[], { pagination: PaginationMeta }>('/cars', {
      params: cleanParams(q),
    }),

  featured: () => get<Car[]>('/cars/featured'),
  latest: () => get<Car[]>('/cars/latest'),
  detail: (id: string) => get<Car>(`/cars/${id}`),
  similar: (id: string) => get<Car[]>(`/cars/${id}/similar`),
  byOwner: (ownerId: string) => get<Car[]>(`/cars/by-owner/${ownerId}`),

  // Auth-gated (owner) — manage my own listings.
  mine: () => get<Car[]>('/cars/mine'),
  create: (body: CarInput) => post<Car>('/cars', body),
  update: (id: string, body: Partial<CarInput>) => patch<Car>(`/cars/${id}`, body),
  remove: (id: string) => del<{ message: string }>(`/cars/${id}`),
  mark: (id: string, status: 'sold' | 'rented') => post<Car>(`/cars/${id}/mark`, { status }),
};
