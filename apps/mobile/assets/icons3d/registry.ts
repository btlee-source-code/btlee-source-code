/**
 * 3D category-icon registry (Expo Go friendly — no native module).
 *
 * Each category has a 3D **emoji** shown right now (renders everywhere, including
 * Expo Go), plus an optional **image** slot for a real 3D icon. Drop an animated
 * WebP/GIF (or a static 3D PNG) at the path and wire it into `image` — expo-image
 * renders it (and auto-plays animated formats). No native build needed; adding or
 * swapping assets ships over the air with `eas update`.
 *
 * Prefer a single, visually-consistent icon set (same style/lighting/palette) so
 * the rail reads as one family — that's what makes it feel premium.
 */
import type { CarBodyType } from '@/shared/types/car';
import type { PropertyType } from '@/shared/types/property';

/** `image` is a `require(...)`d asset id (number) once a real 3D icon is added. */
export type Icon3D = { emoji: string; image?: number };

export const PROPERTY_ICONS: Record<PropertyType, Icon3D> = {
  apartment: { emoji: '🏢' /* image: require('./property/apartment.webp') */ },
  villa: { emoji: '🏡' },
  chalet: { emoji: '🏖️' },
  shop: { emoji: '🏪' },
  building: { emoji: '🏬' },
  factory: { emoji: '🏭' },
};

export const CAR_ICONS: Record<CarBodyType, Icon3D> = {
  sedan: { emoji: '🚗' },
  suv: { emoji: '🚙' },
  hatchback: { emoji: '🚗' },
  coupe: { emoji: '🏎️' },
  pickup: { emoji: '🛻' },
  minivan: { emoji: '🚐' },
  crossover: { emoji: '🚙' },
};
