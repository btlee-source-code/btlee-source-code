/**
 * Domain enum VALUES come from `@btlee/shared` (canonical, shared with the
 * server + web). This file keeps only the Arabic/English LABEL maps + mobile-UI
 * bits (SORT_OPTIONS) — locale concerns that don't belong in the shared package.
 */
import { localeMap } from '@/config/locale';
import type { ReportReason } from '@btlee/shared';
import type {
  DepositOption,
  FinishingType,
  FurnishingStatus,
  ListingType,
  PropertyCategory,
  PropertyService,
  PropertyStatus,
  PropertyType,
} from '@/shared/types/property';

// Enum arrays + limits — re-exported from the shared package so every call site
// (`@/shared/lib/constants`) stays unchanged while the source of truth is single.
export {
  DEPOSIT_OPTIONS,
  FINISHING_CONDITION_TYPES,
  FINISHING_TYPES,
  FURNISHING_STATUS_TYPES,
  GOVERNORATES,
  LISTING_TYPES,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES,
  PROPERTY_CATEGORIES,
  PROPERTY_SERVICES,
  PROPERTY_TYPES,
  REPORT_REASONS,
} from '@btlee/shared';
export type { ReportReason };

export const TYPE_LABELS = localeMap<PropertyType>(
  { apartment: 'شقة', villa: 'فيلا', chalet: 'شاليه', shop: 'محل', building: 'مبنى', factory: 'مصنع', land: 'أرض' },
  { apartment: 'Apartment', villa: 'Villa', chalet: 'Chalet', shop: 'Shop', building: 'Building', factory: 'Factory', land: 'Land' }
);

const PROPERTY_TYPES_WITHOUT_ROOMS = new Set(['shop', 'factory', 'land']);
const PROPERTY_TYPES_WITHOUT_FINISHING = new Set(['factory', 'land']);

export function propertyTypeHasRooms(type: string): boolean {
  return type !== '' && !PROPERTY_TYPES_WITHOUT_ROOMS.has(type);
}

export function propertyTypeHasFinishing(type: string): boolean {
  return type !== '' && !PROPERTY_TYPES_WITHOUT_FINISHING.has(type);
}

export const LISTING_TYPE_LABELS = localeMap<ListingType>(
  { sale: 'للبيع', rent: 'للإيجار' },
  { sale: 'For sale', rent: 'For rent' }
);

export const CATEGORY_LABELS = localeMap<PropertyCategory>(
  {
    residential: 'سكني',
    commercial: 'تجاري',
    industrial: 'صناعي',
    agricultural: 'زراعي',
  },
  {
    residential: 'Residential',
    commercial: 'Commercial',
    industrial: 'Industrial',
    agricultural: 'Agricultural',
  }
);

export const FINISHING_LABELS = localeMap<FinishingType>(
  {
    unfinished: 'بدون تشطيب',
    'semi-finished': 'نصف تشطيب',
    'standard-finished': 'تشطيب عادي',
    lux: 'لوكس',
    'super-lux': 'سوبر لوكس',
    'high-lux': 'هاي لوكس',
    'ultra-lux': 'ألترا لوكس',
  },
  {
    unfinished: 'Unfinished',
    'semi-finished': 'Semi-finished',
    'standard-finished': 'Standard finishing',
    lux: 'Lux',
    'super-lux': 'Super Lux',
    'high-lux': 'High Lux',
    'ultra-lux': 'Ultra Lux',
  }
);

export const FURNISHING_LABELS = localeMap<FurnishingStatus>(
  {
    unfurnished: 'غير مفروش',
    'semi-furnished': 'نصف مفروش',
    furnished: 'مفروش',
    'fully-furnished': 'مفروش بالكامل',
  },
  {
    unfurnished: 'Unfurnished',
    'semi-furnished': 'Semi-furnished',
    furnished: 'Furnished',
    'fully-furnished': 'Fully furnished',
  }
);

/** Keep edit/detail screens safe while legacy listings are migrated. */
export function normalizeFinishing(value?: string): FinishingType {
  return (['unfinished', 'semi-finished', 'standard-finished', 'lux', 'super-lux', 'high-lux', 'ultra-lux'] as string[]).includes(value ?? '')
    ? (value as FinishingType)
    : 'standard-finished';
}

export function resolveFurnishing(
  finishing?: string,
  furnishing?: string
): FurnishingStatus {
  if ((['unfurnished', 'semi-furnished', 'furnished', 'fully-furnished'] as string[]).includes(furnishing ?? '')) {
    return furnishing as FurnishingStatus;
  }
  return finishing === 'furnished' ? 'furnished' : 'unfurnished';
}

export const SERVICE_LABELS = localeMap<PropertyService>(
  { gas: 'غاز', water: 'مياه', electricity: 'كهرباء', wifi: 'واي فاي' },
  { gas: 'Gas', water: 'Water', electricity: 'Electricity', wifi: 'Wi-Fi' }
);

export const DEPOSIT_LABELS = localeMap<DepositOption>(
  { half_month: 'نص شهر', one_month: 'شهر', two_months: 'شهرين', three_months: 'ثلاثة أشهر' },
  { half_month: 'Half month', one_month: 'One month', two_months: 'Two months', three_months: 'Three months' }
);

export const STATUS_LABELS = localeMap<PropertyStatus>(
  {
    pending: 'تحت المراجعة',
    approved: 'منشور',
    rejected: 'مرفوض',
    sold: 'تم البيع',
    rented: 'تم التأجير',
    expired: 'منتهي الصلاحية',
  },
  {
    pending: 'Under review',
    approved: 'Published',
    rejected: 'Rejected',
    sold: 'Sold',
    rented: 'Rented',
    expired: 'Expired',
  }
);

export const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'price_asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'price_desc', label: 'السعر: من الأعلى للأقل' },
] as const;

export const REPORT_REASON_LABELS = localeMap<ReportReason>(
  {
    fake_listing: 'إعلان مزيف',
    wrong_info: 'معلومات خاطئة',
    duplicate: 'إعلان مكرر',
    inappropriate: 'محتوى غير لائق',
    spam: 'رسائل مزعجة',
    other: 'سبب آخر',
  },
  {
    fake_listing: 'Fake listing',
    wrong_info: 'Wrong information',
    duplicate: 'Duplicate listing',
    inappropriate: 'Inappropriate content',
    spam: 'Spam',
    other: 'Other',
  }
);
