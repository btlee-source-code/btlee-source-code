/**
 * Wishlist API client
 */
import { http } from '@/shared/api/httpClient';
import type { Property } from '@/shared/types/property';

export const wishlistApi = {
  get: () => http.get<Property[]>('/wishlist'),
  add: (propertyId: string) =>
    http.post<{ message: string }>(`/wishlist/${propertyId}`),
  remove: (propertyId: string) =>
    http.delete<{ message: string }>(`/wishlist/${propertyId}`),
  check: (propertyId: string) =>
    http.get<{ inWishlist: boolean }>(`/wishlist/${propertyId}/check`),
};
