/**
 * Saved Searches API client
 */
import { http } from '@/shared/api/httpClient';

export interface SavedSearch {
  _id: string;
  user: string;
  name: string;
  search: string | null;
  type: string | null;
  listingType: string | null;
  category: string | null;
  governorate: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  minArea: number | null;
  createdAt: string;
}

export const savedSearchesApi = {
  list: () => http.get<SavedSearch[]>('/saved-searches'),
  create: (input: Partial<Omit<SavedSearch, '_id' | 'user' | 'createdAt'>> & { name: string }) =>
    http.post<SavedSearch>('/saved-searches', input),
  remove: (id: string) => http.delete<{ message: string }>(`/saved-searches/${id}`),
};
