/**
 * Domain enums + their Arabic labels. Values are server-synced string literals
 * (mirrors apps/web/src/shared/lib/constants.ts + the `property.*` message keys).
 */
import { localeMap } from '@/config/locale';
import type {
  DepositOption,
  FinishingType,
  ListingType,
  PropertyCategory,
  PropertyService,
  PropertyStatus,
  PropertyType,
} from '@/shared/types/property';

export const PROPERTY_TYPES: readonly PropertyType[] = [
  'apartment',
  'villa',
  'chalet',
  'shop',
  'building',
  'factory',
];
export const LISTING_TYPES: readonly ListingType[] = ['sale', 'rent'];
export const PROPERTY_CATEGORIES: readonly PropertyCategory[] = ['residential', 'commercial'];
export const FINISHING_TYPES: readonly FinishingType[] = ['furnished', 'unfurnished', 'semi-finished'];
export const PROPERTY_SERVICES: readonly PropertyService[] = ['gas', 'water', 'electricity', 'wifi'];
export const DEPOSIT_OPTIONS: readonly DepositOption[] = [
  'half_month',
  'one_month',
  'two_months',
  'three_months',
];

export const TYPE_LABELS = localeMap<PropertyType>(
  { apartment: 'شقة', villa: 'فيلا', chalet: 'شاليه', shop: 'محل', building: 'مبنى', factory: 'مصنع' },
  { apartment: 'Apartment', villa: 'Villa', chalet: 'Chalet', shop: 'Shop', building: 'Building', factory: 'Factory' }
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

/** 27 Egyptian governorates — the stored Arabic values ARE the labels. */
export const GOVERNORATES: readonly string[] = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'price_asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'price_desc', label: 'السعر: من الأعلى للأقل' },
] as const;

export const MAX_IMAGES = 15;
export const MAX_DESCRIPTION_LENGTH = 500;

/** Report reasons — must match the server enum exactly. */
export type ReportReason = 'fake_listing' | 'wrong_info' | 'duplicate' | 'inappropriate' | 'spam' | 'other';

export const REPORT_REASONS: readonly ReportReason[] = [
  'fake_listing',
  'wrong_info',
  'duplicate',
  'inappropriate',
  'spam',
  'other',
];

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
