/**
 * Car wire shape — the JSON the backend returns (`apps/server/src/modules/cars`).
 * Canonical source shared by web + mobile so both agree on one contract. The
 * enum-derived unions come from `../constants/car.ts` so values and types never
 * drift. Mirrors the structure of `property.ts`; the car domain keeps its own
 * (small) owner/image/geo shapes so the vertical slice stays self-contained.
 */
import type {
  CarBodyType,
  CarCondition,
  CarFuelType,
  CarListingType,
  CarStatus,
  CarTransmission,
} from '../constants/car';

export interface CarOwner {
  _id: string;
  name: string;
  avatar?: string | null;
}

export interface CarImage {
  publicId: string;
  url: string;
}

export interface CarGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Car {
  _id: string;
  seq?: number;
  owner: CarOwner | null; // null when the owner account was deleted

  // Classification
  listingType: CarListingType;
  condition: CarCondition;

  // Specs
  make: string; // free text (e.g. "Toyota")
  model: string; // free text (e.g. "Corolla")
  year: number;
  mileage: number | null; // km driven; null for brand-new cars
  transmission: CarTransmission;
  fuelType: CarFuelType;
  bodyType: CarBodyType;
  color: string | null;

  // Pricing
  price: number | null; // EGP; null => "price on request"

  // Location
  governorate: string; // Arabic name
  area_name: string; // neighborhood
  location?: CarGeoPoint | null; // absent when no map pin

  // Content
  description: string;
  images: CarImage[]; // images[0] is the cover
  whatsappNumber: string; // ^201\d{9}$

  // Lifecycle
  status: CarStatus;
  rejectionReason: string | null;
  durationDays: number;
  expiresAt: string;
  isFeatured: boolean;

  // Metrics
  viewCount: number;
  ratingAvg: number;
  ratingCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
