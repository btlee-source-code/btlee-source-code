/**
 * Property-domain constants — canonical source of truth for the enum VALUES
 * shared across server / web / mobile.
 *
 * Adding a new domain later = a sibling file (e.g. `car.ts`) exporting that
 * domain's enums, registered in `shared.ts` via `LISTING_KINDS`/`TARGET_TYPES`.
 *
 * NOTE: label maps (Arabic/English text) stay in each client — they are
 * locale/UI concerns, not domain contract. This file holds only the raw
 * literals that the server validates against and every client agrees on.
 */

export const PROPERTY_TYPES = ['apartment', 'villa', 'chalet', 'shop', 'building', 'factory', 'land'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ['sale', 'rent'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_CATEGORIES = [
  'residential',
  'commercial',
  'industrial',
  'agricultural',
] as const;
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

export const REPORT_REASONS = [
  'fake_listing',
  'wrong_info',
  'duplicate',
  'inappropriate',
  'spam',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** 27 Egyptian governorates — the stored Arabic values ARE the labels. */
export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج',
] as const;

// Listing limits (shared by validation + upload UIs).
export const MAX_IMAGES = 15;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MIN_LISTING_DURATION_DAYS = 30;
export const MAX_LISTING_DURATION_DAYS = 365;
