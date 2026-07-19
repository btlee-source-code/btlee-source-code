import { get, post } from '@/shared/api/httpClient';

export interface RatingResult {
  ratingAvg: number;
  ratingCount: number;
  myRating: number;
}

/**
 * Ratings API — one immutable rating per user per property, enforced
 * server-side. Repeated submissions return 409; owners and non-approved
 * listings are rejected too.
 */
export const ratingsApi = {
  rate: (propertyId: string, value: number) => post<RatingResult>(`/ratings/${propertyId}`, { value }),
  mine: (propertyId: string) => get<{ myRating: number | null }>(`/ratings/${propertyId}/me`),
};
