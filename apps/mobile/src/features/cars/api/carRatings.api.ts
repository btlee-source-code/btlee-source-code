import { get, post } from '@/shared/api/httpClient';

export interface RatingResult {
  ratingAvg: number;
  ratingCount: number;
  myRating: number;
}

/**
 * Car ratings API — the car counterpart of `properties/api/ratings.api.ts`.
 * `rate` is an idempotent upsert (one rating per user per car, enforced
 * server-side); it 403s on your own listing and 400s for non-approved cars.
 */
export const carRatingsApi = {
  rate: (carId: string, value: number) => post<RatingResult>(`/ratings/car/${carId}`, { value }),
  mine: (carId: string) => get<{ myRating: number | null }>(`/ratings/car/${carId}/me`),
};
