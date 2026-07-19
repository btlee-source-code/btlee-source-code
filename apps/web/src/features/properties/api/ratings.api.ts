/**
 * Ratings API client
 */
import { http } from '@/shared/api/httpClient';

export interface RateResult {
  ratingAvg: number;
  ratingCount: number;
  myRating: number;
}

export const ratingsApi = {
  /** Submit the current user's one-time 1–5 rating for a property. */
  rate: (propertyId: string, value: number) =>
    http.post<RateResult>(`/ratings/${propertyId}`, { value }),

  /** The current user's existing rating for a property (null if none). */
  mine: (propertyId: string) =>
    http.get<{ myRating: number | null }>(`/ratings/${propertyId}/me`),
};
