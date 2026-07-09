/**
 * Property domain types — the wire shape returned by the backend
 * (`apps/server/src/modules/properties`). Mirrors the web
 * `apps/web/src/shared/types/property.ts`. Kept here for now; can be hoisted to
 * `packages/shared` later so web + mobile + server share one source.
 */
export type PropertyType = 'apartment' | 'villa' | 'chalet' | 'shop' | 'building' | 'factory';
export type ListingType = 'sale' | 'rent';
export type PropertyCategory = 'residential' | 'commercial';
export type FinishingType = 'furnished' | 'unfurnished' | 'semi-finished';
export type PropertyService = 'gas' | 'water' | 'electricity' | 'wifi';
export type DepositOption = 'half_month' | 'one_month' | 'two_months' | 'three_months';
export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'rented' | 'expired';

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
