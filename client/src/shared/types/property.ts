/**
 * Property types — mirror the server schema.
 */
import type {
  PropertyType,
  ListingType,
  PropertyCategory,
  FinishingType,
  PropertyService,
  DepositOption,
  PropertyStatus,
} from '../lib/constants';

export interface PropertyImage {
  publicId: string;
  url: string;
}

export interface PropertyOwner {
  _id: string;
  name: string;
  avatar?: string | null;
  email?: string;
}

export interface Property {
  _id: string;
  // Null when the owner's account has been deleted (orphaned listing).
  owner: PropertyOwner | null;
  type: PropertyType;
  listingType: ListingType;
  category: PropertyCategory;
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  area: number | null;
  finishing: FinishingType;
  services: PropertyService[];
  hasElevator: boolean;
  hasGarage: boolean;
  deposit: DepositOption | null;
  price: number | null;
  governorate: string;
  area_name: string;
  // Null/absent when the owner did not pin a map location.
  location?: { type: 'Point'; coordinates: [number, number] } | null;
  description: string;
  images: PropertyImage[];
  whatsappNumber: string;
  status: PropertyStatus;
  rejectionReason: string | null;
  durationDays: number;
  expiresAt: string;
  isFeatured: boolean;
  viewCount: number;
  // Denormalized rating aggregates. ratingAvg is 0 until the listing has ratings.
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}
