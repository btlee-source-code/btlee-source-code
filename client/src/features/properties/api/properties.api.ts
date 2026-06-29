/**
 * Properties API client
 */
import { http } from '@/shared/api/httpClient';
import type { Property } from '@/shared/types/property';
import type { PaginationMeta } from '@/shared/types/api';

export interface PropertyListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  listingType?: string;
  category?: string;
  governorate?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minArea?: number;
  finishing?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  featured?: boolean;
}

function buildQuery(params: PropertyListParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, String(v));
  });
  const str = search.toString();
  return str ? `?${str}` : '';
}

export interface SearchSuggestion {
  label: string;
  sublabel?: string;
  kind: 'area' | 'governorate';
  href: string;
}

export interface SuggestedProperty {
  _id: string;
  label: string;
  sublabel: string;
  type: string;
  listingType: string;
  price: number | null;
  image: string | null;
}

export interface SuggestionsResponse {
  items: SearchSuggestion[];
  properties: SuggestedProperty[];
}

export interface PagedProperties {
  items: Property[];
  total: number;
  totalPages: number;
  page: number;
}

export const propertiesApi = {
  list: (params: PropertyListParams = {}) =>
    http.get<Property[]>(`/properties${buildQuery(params)}`),

  // Like list(), but also surfaces the real total count + page info so the
  // listings page can paginate / "load more" instead of being capped at the
  // first page (which made selecting "الكل" still show only ~12 results).
  listPaged: async (params: PropertyListParams = {}): Promise<PagedProperties> => {
    const { data, meta } = await http.getWithMeta<Property[]>(
      `/properties${buildQuery(params)}`,
    );
    const pagination = (meta as { pagination?: PaginationMeta } | undefined)?.pagination;
    return {
      items: data,
      total: pagination?.total ?? data.length,
      totalPages: pagination?.totalPages ?? 1,
      page: pagination?.page ?? 1,
    };
  },

  featured: () => http.get<Property[]>('/properties/featured'),
  latest: () => http.get<Property[]>('/properties/latest'),
  suggestions: (q: string) =>
    http.get<SuggestionsResponse>(
      `/properties/suggestions?q=${encodeURIComponent(q)}`,
    ),

  getOne: (id: string) => http.get<Property>(`/properties/${id}`),
  similar: (id: string) => http.get<Property[]>(`/properties/${id}/similar`),
  byOwner: (ownerId: string) => http.get<Property[]>(`/properties/by-owner/${ownerId}`),

  mine: () => http.get<Property[]>('/properties/mine'),

  create: (input: unknown) => http.post<Property>('/properties', input),
  update: (id: string, input: unknown) => http.patch<Property>(`/properties/${id}`, input),
  remove: (id: string) => http.delete<{ message: string }>(`/properties/${id}`),
  mark: (id: string, status: 'sold' | 'rented') =>
    http.post<Property>(`/properties/${id}/mark`, { status }),
};

export interface ListResponse<T> {
  items: T[];
  meta?: { pagination?: PaginationMeta };
}
