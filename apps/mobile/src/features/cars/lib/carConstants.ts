/**
 * Car-domain LABEL maps (Arabic/English) — the locale-UI counterpart to the
 * shared enum VALUES in `@btlee/shared`. Mirrors `shared/lib/constants.ts` for
 * the property domain; kept in the cars feature so the slice stays self-contained.
 *
 * The sale/rent labels are reused from the shared property constants
 * (LISTING_TYPE_LABELS) — same values, no need to duplicate.
 */
import { localeMap } from '@/config/locale';
import type {
  CarBodyType,
  CarCondition,
  CarFuelType,
  CarTransmission,
} from '@/shared/types/car';

// Enum arrays re-exported from the shared package for pickers / category rails.
export { CAR_BODY_TYPES, CAR_CONDITIONS, CAR_FUEL_TYPES, CAR_TRANSMISSIONS } from '@btlee/shared';

export const CAR_BODY_TYPE_LABELS = localeMap<CarBodyType>(
  {
    sedan: 'سيدان',
    suv: 'دفع رباعي',
    hatchback: 'هاتشباك',
    coupe: 'كوبيه',
    pickup: 'بيك أب',
    minivan: 'ميني فان',
    crossover: 'كروس أوفر',
  },
  {
    sedan: 'Sedan',
    suv: 'SUV',
    hatchback: 'Hatchback',
    coupe: 'Coupe',
    pickup: 'Pickup',
    minivan: 'Minivan',
    crossover: 'Crossover',
  }
);

export const CAR_TRANSMISSION_LABELS = localeMap<CarTransmission>(
  { automatic: 'أوتوماتيك', manual: 'مانيوال' },
  { automatic: 'Automatic', manual: 'Manual' }
);

export const CAR_FUEL_TYPE_LABELS = localeMap<CarFuelType>(
  { petrol: 'بنزين', diesel: 'ديزل', hybrid: 'هايبرد', electric: 'كهرباء', natural_gas: 'غاز طبيعي' },
  { petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Electric', natural_gas: 'Natural gas' }
);

export const CAR_CONDITION_LABELS = localeMap<CarCondition>(
  { new: 'جديدة', used: 'مستعملة' },
  { new: 'New', used: 'Used' }
);
