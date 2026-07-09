/**
 * Domain enums + their Arabic labels. Values are server-synced string literals
 * (mirrors apps/web/src/shared/lib/constants.ts + the `property.*` message keys).
 */
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

export const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  chalet: 'شاليه',
  shop: 'محل',
  building: 'مبنى',
  factory: 'مصنع',
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: 'للبيع',
  rent: 'للإيجار',
};

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  residential: 'سكني',
  commercial: 'تجاري',
};

export const FINISHING_LABELS: Record<FinishingType, string> = {
  furnished: 'مفروش',
  unfurnished: 'غير مفروش',
  'semi-finished': 'نص تشطيب',
};

export const SERVICE_LABELS: Record<PropertyService, string> = {
  gas: 'غاز',
  water: 'مياه',
  electricity: 'كهرباء',
  wifi: 'واي فاي',
};

export const DEPOSIT_LABELS: Record<DepositOption, string> = {
  half_month: 'نص شهر',
  one_month: 'شهر',
  two_months: 'شهرين',
  three_months: 'ثلاثة أشهر',
};

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  pending: 'تحت المراجعة',
  approved: 'منشور',
  rejected: 'مرفوض',
  sold: 'تم البيع',
  rented: 'تم التأجير',
  expired: 'منتهي الصلاحية',
};

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
