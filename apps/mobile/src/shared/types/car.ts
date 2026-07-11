/**
 * Car wire types — canonical source: `@btlee/shared`.
 * Re-exported here so `@/shared/types/car` imports stay stable (thin shim,
 * mirrors `property.ts`). Add new shared types to the package, not to this file.
 */
export type {
  Car,
  CarOwner,
  CarImage,
  CarGeoPoint,
  CarListingType,
  CarCondition,
  CarTransmission,
  CarFuelType,
  CarBodyType,
  CarStatus,
} from '@btlee/shared';
