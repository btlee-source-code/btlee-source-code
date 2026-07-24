import { http } from '@/shared/api/httpClient';

export interface LocationSuggestion {
  x: number;
  y: number;
  label: string;
}

export const locationsApi = {
  search: (query: string) =>
    http.get<LocationSuggestion[]>('/locations/search', {
      params: { q: query.trim() },
      timeout: 8_000,
    }),
};
