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
export type Icon3D = {
  emoji: string;
  image?: number;
  imageWidth?: number;
  nativeImage?: boolean;
};

export const PROPERTY_ICONS: Record<PropertyType, Icon3D> = {
  apartment: { emoji: '🏢' /* image: require('./property/apartment.webp') */ },
  villa: { emoji: '🏡' },
  chalet: { emoji: '🏖️' },
  shop: { emoji: '🏪' },
  building: { emoji: '🏬' },
  factory: { emoji: '🏭' },
  land: { emoji: '🏞️' },
};

/**
 * 3D icons for the home section switcher (properties ⇄ cars) — same Fluent 3D
 * family as the car category icons so the two pills read as one set.
 */
export const SECTION_ICONS = {
  properties: require('./property/house.png') as number,
  cars: require('./car/sedan.png') as number,
} as const;

// Real 3D car icons (Microsoft Fluent Emoji 3D — MIT licensed). The emoji stays
// as a safe fallback if an image ever fails to load. `crossover` reuses the SUV
// art (closest match); every other body type has its own.
export const CAR_ICONS: Record<CarBodyType, Icon3D> = {
  sedan: {
    emoji: '🚗',
    image: require('./car/sedan-photo-final.png'),
    imageWidth: 52,
    nativeImage: true,
  },
  suv: {
    emoji: '🚙',
    image: require('./car/suv-photo-final.png'),
    imageWidth: 52,
    nativeImage: true,
  },
  hatchback: {
    emoji: '🚗',
    image: require('./car/hatchback-photo-final.png'),
    imageWidth: 52,
    nativeImage: true,
  },
  coupe: { emoji: '🏎️', image: require('./car/coupe.png') },
  pickup: {
    emoji: '🛻',
    image: require('./car/pickup-photo-final.png'),
    imageWidth: 52,
    nativeImage: true,
  },
  minivan: {
    emoji: '🚐',
    image: require('./car/minivan-photo-final.png'),
    imageWidth: 52,
    nativeImage: true,
  },
  crossover: {
    emoji: '🚙',
    image: require('./car/crossover-photo-final.png'),
    imageWidth: 52,
    nativeImage: true,
  },
};
