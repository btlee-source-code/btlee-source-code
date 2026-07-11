/**
 * Arabic labels for car enums, used by the admin cars pages. The admin panel
 * hardcodes Arabic chrome (the property admin does the same); car status labels
 * are reused from the shared next-intl `property` namespace since the enum is
 * identical (pending/approved/rejected/sold/rented/expired).
 */
import type {
  CarBodyType,
  CarCondition,
  CarFuelType,
  CarListingType,
  CarTransmission,
} from '@/shared/types/car';

export const CAR_LISTING_TYPE_LABELS: Record<CarListingType, string> = {
  sale: 'للبيع',
  rent: 'للإيجار',
};

export const CAR_CONDITION_LABELS: Record<CarCondition, string> = {
  new: 'جديدة',
  used: 'مستعملة',
};

export const CAR_TRANSMISSION_LABELS: Record<CarTransmission, string> = {
  automatic: 'أوتوماتيك',
  manual: 'مانيوال',
};

export const CAR_FUEL_LABELS: Record<CarFuelType, string> = {
  petrol: 'بنزين',
  diesel: 'ديزل',
  hybrid: 'هايبرد',
  electric: 'كهرباء',
  natural_gas: 'غاز طبيعي',
};

export const CAR_BODY_TYPE_LABELS: Record<CarBodyType, string> = {
  sedan: 'سيدان',
  suv: 'دفع رباعي',
  hatchback: 'هاتشباك',
  coupe: 'كوبيه',
  pickup: 'بيك أب',
  minivan: 'ميني فان',
  crossover: 'كروس أوفر',
};
