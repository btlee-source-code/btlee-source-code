import { get, post } from '@/shared/api/httpClient';

export interface RatingResult {
  ratingAvg: number;
  ratingCount: number;
  myRating: number;
}

/**
 * Car ratings API — the car counterpart of `properties/api/ratings.api.ts`.
 * Each user gets one editable rating per car, enforced server-side. Repeated
 * submissions update the existing value; owners and non-approved cars are
 * still rejected.
 */
export const carRatingsApi = {
  rate: (carId: string, value: number) => post<RatingResult>(`/ratings/car/${carId}`, { value }),
  mine: (carId: string) => get<{ myRating: number | null }>(`/ratings/car/${carId}/me`),
};
