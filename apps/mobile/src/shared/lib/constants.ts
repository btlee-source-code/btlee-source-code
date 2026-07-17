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
  FINISHING_TYPES,
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

export const LISTING_TYPE_LABELS = localeMap<ListingType>(
  { sale: 'للبيع', rent: 'للإيجار' },
  { sale: 'For sale', rent: 'For rent' }
);

export const CATEGORY_LABELS = localeMap<PropertyCategory>(
  { residential: 'سكني', commercial: 'تجاري' },
  { residential: 'Residential', commercial: 'Commercial' }
);

export const FINISHING_LABELS = localeMap<FinishingType>(
  { furnished: 'مفروش', unfurnished: 'غير مفروش', 'semi-finished': 'نص تشطيب' },
  { furnished: 'Furnished', unfurnished: 'Unfurnished', 'semi-finished': 'Semi-finished' }
);

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
