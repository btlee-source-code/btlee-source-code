/**
 * Domain constants — kept in sync with the server.
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
