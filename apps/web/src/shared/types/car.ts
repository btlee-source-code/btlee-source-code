/**
 * Car types — mirror the server schema (apps/server/src/modules/cars).
 * Local to the web app (like property.ts) — the web keeps its own copy.
 */
export type CarListingType = 'sale' | 'rent';
export type CarCondition = 'new' | 'used';
export type CarTransmission = 'automatic' | 'manual';
export type CarFuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'natural_gas';
export type CarBodyType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'pickup' | 'minivan' | 'crossover';
export type CarStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'rented' | 'expired';

export interface CarImage {
  publicId: string;
  url: string;
}

export interface CarOwner {
  _id: string;
  name: string;
  avatar?: string | null;
  email?: string;
}

export interface Car {
  _id: string;
  seq?: number;
  owner: CarOwner | null;
  listingType: CarListingType;
  condition: CarCondition;
  make: string;
  model: string;
  year: number;
  mileage: number | null;
  transmission: CarTransmission;
  fuelType: CarFuelType;
  bodyType: CarBodyType;
  color: string | null;
  price: number | null;
  governorate: string;
  area_name: string;
  location?: { type: 'Point'; coordinates: [number, number] } | null;
  description: string;
  images: CarImage[];
  whatsappNumber: string;
  status: CarStatus;
  rejectionReason: string | null;
  durationDays: number;
  expiresAt: string;
  isFeatured: boolean;
  viewCount: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}
