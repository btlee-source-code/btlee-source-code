import { get, post } from '@/shared/api/httpClient';

export interface RatingResult {
  ratingAvg: number;
  ratingCount: number;
  myRating: number;
}

/**
 * Ratings API — one editable rating per user per property, enforced
 * server-side. Repeated submissions update the existing value; owners and
 * non-approved listings are still rejected.
 */
export const ratingsApi = {
  rate: (propertyId: string, value: number) => post<RatingResult>(`/ratings/${propertyId}`, { value }),
  mine: (propertyId: string) => get<{ myRating: number | null }>(`/ratings/${propertyId}/me`),
};
