/**
 * Properties API — thin wrappers over the shared http client, mirroring the web
 * `properties.api.ts`. All list/detail/featured/latest endpoints are PUBLIC
 * (no auth needed).
 */
import { del, get, getWithMeta, patch, post } from '@/shared/api/httpClient';
import type { Property, PropertyImage } from '@/shared/types/property';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Search-suggestions response (GET /properties/suggestions?q=). */
export interface SearchSuggestion {
  label: string;
  sublabel?: string;
  kind: 'area' | 'governorate';
  href: string; // web path — ignored on mobile; map by `kind` instead
}
export interface SuggestedProperty {
  _id: string;
  label: string; // = area_name (no title field in the domain)
  sublabel: string; // = governorate
  type: string;
  listingType: string;
  price: number | null;
  image: string | null;
}
export interface SuggestionsResponse {
  items: SearchSuggestion[];
  properties: SuggestedProperty[];
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

/** Body for creating/updating a listing (mirrors the server createPropertySchema). */
export interface PropertyInput {
  type: string;
  listingType: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  floor?: number | null;
  area?: number | null;
  finishing: string;
  services?: string[];
  hasElevator?: boolean;
  hasGarage?: boolean;
  deposit?: string | null;
  price?: number | null;
  governorate: string;
  area_name: string;
  coordinates?: [number, number]; // [lng, lat]
  description: string;
  images: PropertyImage[];
  whatsappNumber: string;
  durationDays: number;
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

  /** Bilingual, Arabic-tolerant matching happens server-side — send the raw text. */
  suggestions: (q: string) => get<SuggestionsResponse>('/properties/suggestions', { params: { q } }),
  similar: (id: string) => get<Property[]>(`/properties/${id}/similar`),
  byOwner: (ownerId: string) => get<Property[]>(`/properties/by-owner/${ownerId}`),

  // Auth-gated (owner) — manage my own listings.
  mine: () => get<Property[]>('/properties/mine'),
  create: (body: PropertyInput) => post<Property>('/properties', body),
  update: (id: string, body: Partial<PropertyInput>) => patch<Property>(`/properties/${id}`, body),
  remove: (id: string) => del<{ message: string }>(`/properties/${id}`),
  mark: (id: string, status: 'sold' | 'rented') => post<Property>(`/properties/${id}/mark`, { status }),
};
