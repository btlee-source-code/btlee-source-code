/**
 * Application-wide constants.
 * Domain enums used across modules — keep in sync with the client.
 */

export const PROPERTY_TYPES = ['apartment', 'villa', 'chalet', 'shop', 'building', 'factory'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ['sale', 'rent'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_CATEGORIES = ['residential', 'commercial'] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];

export const FINISHING_TYPES = ['furnished', 'unfurnished', 'semi-finished'] as const;
export type FinishingType = (typeof FINISHING_TYPES)[number];

// Utilities the owner can flag as available (gas / water / electricity / wifi).
export const PROPERTY_SERVICES = ['gas', 'water', 'electricity', 'wifi'] as const;
export type PropertyService = (typeof PROPERTY_SERVICES)[number];

// Required deposit for rentals (التأمين المطلوب).
export const DEPOSIT_OPTIONS = ['half_month', 'one_month', 'two_months', 'three_months'] as const;
export type DepositOption = (typeof DEPOSIT_OPTIONS)[number];

export const PROPERTY_STATUS = ['pending', 'approved', 'rejected', 'sold', 'rented', 'expired'] as const;
export type PropertyStatus = (typeof PROPERTY_STATUS)[number];

// ── Car domain enums ──
// Server-side mirror of packages/shared `constants/car.ts` (the server owns its
// own copy for Mongoose validation — it does not import the shared package at
// runtime). `make` / `model` / `color` are free-text (validated as strings),
// so there is no server enum for them.
export const CAR_LISTING_TYPES = ['sale', 'rent'] as const;
export type CarListingType = (typeof CAR_LISTING_TYPES)[number];

export const CAR_CONDITIONS = ['new', 'used'] as const;
export type CarCondition = (typeof CAR_CONDITIONS)[number];

export const CAR_TRANSMISSIONS = ['automatic', 'manual'] as const;
export type CarTransmission = (typeof CAR_TRANSMISSIONS)[number];

export const CAR_FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric', 'natural_gas'] as const;
export type CarFuelType = (typeof CAR_FUEL_TYPES)[number];

export const CAR_BODY_TYPES = ['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'minivan', 'crossover'] as const;
export type CarBodyType = (typeof CAR_BODY_TYPES)[number];

export const CAR_STATUS = ['pending', 'approved', 'rejected', 'sold', 'rented', 'expired'] as const;
export type CarStatus = (typeof CAR_STATUS)[number];

export const MIN_CAR_YEAR = 1950;

// ── Cross-domain (domain-readiness) ──
// What the SHARED systems (wishlist / ratings / reports / saved-searches) can
// point at. Mirrors packages/shared `TARGET_TYPES` (the server owns its own copy
// for Mongoose validation — it does not import the shared package at runtime).
// Widening this automatically widens the `enum` on the ratings/reports models.
export const TARGET_TYPES = ['property', 'car'] as const;
export type TargetType = (typeof TARGET_TYPES)[number];
export const DEFAULT_TARGET_TYPE: TargetType = 'property';

export const USER_GOALS = ['buy', 'rent', 'sell', 'browse'] as const;
export type UserGoal = (typeof USER_GOALS)[number];

export const NOTIFICATION_TYPES = [
  'listing_approved',
  'listing_rejected',
  'listing_expired',
  'saved_search_match',
  'listing_reported',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const REPORT_REASONS = [
  'fake_listing',
  'wrong_info',
  'duplicate',
  'inappropriate',
  'spam',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const MAX_IMAGES_PER_PROPERTY = 15;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MIN_LISTING_DURATION_DAYS = 30;
export const MAX_LISTING_DURATION_DAYS = 365;
