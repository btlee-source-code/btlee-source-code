/**
 * Properties API — thin wrappers over the shared http client, mirroring the web
 * `properties.api.ts`. All list/detail/featured/latest endpoints are PUBLIC
 * (no auth needed).
 */
import { get, getWithMeta } from '@/shared/api/httpClient';
import type { Property } from '@/shared/types/property';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PropertyQuery {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  search?: string;
  type?: string;
  listingType?: string;
  category?: string;
  governorate?: string;
  finishing?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minArea?: number;
}

/** Drop empty params so the backend applies its defaults (matches web buildQuery). */
function cleanParams(q: PropertyQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v as string | number;
  }
  return out;
}

export const propertiesApi = {
  /** Paginated list — returns `{ data, meta.pagination }`. */
  list: (q: PropertyQuery = {}) =>
    getWithMeta<Property[], { pagination: PaginationMeta }>('/properties', {
      params: cleanParams(q),
    }),

  featured: () => get<Property[]>('/properties/featured'),
  latest: () => get<Property[]>('/properties/latest'),
  detail: (id: string) => get<Property>(`/properties/${id}`),
  similar: (id: string) => get<Property[]>(`/properties/${id}/similar`),
  byOwner: (ownerId: string) => get<Property[]>(`/properties/by-owner/${ownerId}`),
};
