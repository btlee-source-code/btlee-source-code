/**
 * Property wire shape — the JSON the backend returns
 * (`apps/server/src/modules/properties`). Canonical source shared by web +
 * mobile so both agree on one contract. The enum-derived unions come from
 * `../constants/property.ts` so values and types never drift.
 */
import type {
  DepositOption,
  FinishingType,
  ListingType,
  PropertyCategory,
  PropertyService,
  PropertyStatus,
  PropertyType,
} from '../constants/property';

export interface PropertyOwner {
  _id: string;
  name: string;
  avatar?: string | null;
}

export interface PropertyImage {
  publicId: string;
  url: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Property {
  _id: string;
  seq?: number;
  owner: PropertyOwner | null; // null when the owner account was deleted

  // Classification
  type: PropertyType;
  listingType: ListingType;
  category: PropertyCategory;

  // Specs
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  area: number | null; // m²; null if undisclosed
  finishing: FinishingType;
  services: PropertyService[];
  hasElevator: boolean;
  hasGarage: boolean;
  deposit: DepositOption | null;

  // Pricing
  price: number | null; // EGP; null => "price on request"

  // Location
  governorate: string; // Arabic name
  area_name: string; // neighborhood
  location?: GeoPoint | null; // absent when no map pin

  // Content
  description: string;
  images: PropertyImage[]; // images[0] is the cover
  whatsappNumber: string; // ^201\d{9}$

  // Lifecycle
  status: PropertyStatus;
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
