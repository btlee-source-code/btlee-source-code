import { del, get, post } from '@/shared/api/httpClient';
import type { Property } from '@/shared/types/property';

/** All wishlist endpoints require auth (Bearer). Mirrors the web wishlist.api. */
export const wishlistApi = {
  get: () => get<Property[]>('/wishlist'),
  add: (propertyId: string) => post<{ message: string }>(`/wishlist/${propertyId}`),
  remove: (propertyId: string) => del<{ message: string }>(`/wishlist/${propertyId}`),
};
