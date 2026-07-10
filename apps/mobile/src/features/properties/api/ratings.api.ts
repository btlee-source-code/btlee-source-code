import { get, post } from '@/shared/api/httpClient';

export interface RatingResult {
  ratingAvg: number;
  ratingCount: number;
  myRating: number;
}

/**
 * Ratings API — mirrors the web `ratings.api.ts`. `rate` is an idempotent upsert
 * (one rating per user per property, enforced server-side); it 403s if you try
 * to rate your own listing and 400s for non-approved listings.
 */
export const ratingsApi = {
  rate: (propertyId: string, value: number) => post<RatingResult>(`/ratings/${propertyId}`, { value }),
  mine: (propertyId: string) => get<{ myRating: number | null }>(`/ratings/${propertyId}/me`),
};
