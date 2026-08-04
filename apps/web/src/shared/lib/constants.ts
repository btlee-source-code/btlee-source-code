/**
 * Domain constants — kept in sync with the server.
 */

export const PROPERTY_TYPES = [
  'apartment',
  'villa',
  'chalet',
  'shop',
  'building',
  'factory',
  'land',
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

const PROPERTY_TYPES_WITHOUT_ROOMS = new Set<PropertyType>(['shop', 'factory', 'land']);
const PROPERTY_TYPES_WITHOUT_FINISHING = new Set<PropertyType>(['factory', 'land']);

export function propertyTypeHasRooms(type: string): boolean {
  return type !== '' && !PROPERTY_TYPES_WITHOUT_ROOMS.has(type as PropertyType);
}

export function propertyTypeHasFinishing(type: string): boolean {
  return type !== '' && !PROPERTY_TYPES_WITHOUT_FINISHING.has(type as PropertyType);
}

export const LISTING_TYPES = ['sale', 'rent'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_CATEGORIES = [
  'residential',
  'commercial',
  'industrial',
  'agricultural',
] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];

export const FINISHING_CONDITION_TYPES = [
  'unfinished',
  'semi-finished',
  'standard-finished',
  'lux',
  'super-lux',
  'high-lux',
  'ultra-lux',
] as const;

export const FINISHING_TYPES = FINISHING_CONDITION_TYPES;
export type FinishingType = (typeof FINISHING_TYPES)[number];

export const FURNISHING_STATUS_TYPES = [
  'unfurnished',
  'semi-furnished',
  'furnished',
  'fully-furnished',
] as const;
export type FurnishingStatus = (typeof FURNISHING_STATUS_TYPES)[number];

/** Normalize records created before furnishing became an independent field. */
export function normalizeFinishing(value?: string): FinishingType {
  return FINISHING_TYPES.includes(value as FinishingType)
    ? (value as FinishingType)
    : 'standard-finished';
}

export function resolveFurnishing(
  finishing?: string,
  furnishing?: string
): FurnishingStatus {
  if (FURNISHING_STATUS_TYPES.includes(furnishing as FurnishingStatus)) {
    return furnishing as FurnishingStatus;
  }
  return finishing === 'furnished' ? 'furnished' : 'unfurnished';
}

// Utilities the owner can flag as available (gas / water / electricity / wifi).
export const PROPERTY_SERVICES = ['gas', 'water', 'electricity', 'wifi'] as const;
export type PropertyService = (typeof PROPERTY_SERVICES)[number];

// Required deposit for rentals (التأمين المطلوب).
export const DEPOSIT_OPTIONS = ['half_month', 'one_month', 'two_months', 'three_months'] as const;
export type DepositOption = (typeof DEPOSIT_OPTIONS)[number];

export const PROPERTY_STATUS = ['pending', 'approved', 'rejected', 'sold', 'rented', 'expired'] as const;
export type PropertyStatus = (typeof PROPERTY_STATUS)[number];

export const USER_GOALS = ['buy', 'rent', 'sell', 'browse'] as const;
export type UserGoal = (typeof USER_GOALS)[number];

export const REPORT_REASONS = [
  'fake_listing',
  'wrong_info',
  'duplicate',
  'inappropriate',
  'spam',
  'other',
] as const;

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج',
] as const;

export const MAX_IMAGES = 15;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MIN_DURATION_DAYS = 30;
export const MAX_DURATION_DAYS = 365;
