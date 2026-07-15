import { del, get, post } from '@/shared/api/httpClient';
import type { Car } from '@/shared/types/car';

/** Car wishlist endpoints (auth-gated) — the car counterpart of wishlist.api. */
export const carWishlistApi = {
  get: () => get<Car[]>('/wishlist/cars'),
  add: (carId: string) => post<{ message: string }>(`/wishlist/cars/${carId}`),
  remove: (carId: string) => del<{ message: string }>(`/wishlist/cars/${carId}`),
};
