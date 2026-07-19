/**
 * Car-domain constants — canonical source of truth for the car enum VALUES
 * shared across server / web / mobile. Sibling of `property.ts`; the domain is
 * registered in `shared.ts` via `LISTING_KINDS` / `TARGET_TYPES`.
 *
 * NOTE: `make` / `model` / `color` are FREE-TEXT on the wire (not enums) so a
 * valid make is never rejected by validation. `CAR_MAKES` below is an OPTIONAL
 * suggestion list for client pickers only — the server does not validate makes
 * against it. Label maps (Arabic/English UI text) stay in each client, exactly
 * like the property domain.
 */

// Reuses the sale/rent concept — a car can be for sale or for rent.
export const CAR_LISTING_TYPES = ['sale', 'rent'] as const;
export type CarListingType = (typeof CAR_LISTING_TYPES)[number];

export const CAR_CONDITIONS = ['new', 'used'] as const;
export type CarCondition = (typeof CAR_CONDITIONS)[number];

export const CAR_TRANSMISSIONS = ['automatic', 'manual'] as const;
export type CarTransmission = (typeof CAR_TRANSMISSIONS)[number];

export const CAR_FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric', 'natural_gas'] as const;
export type CarFuelType = (typeof CAR_FUEL_TYPES)[number];

export const CAR_BODY_TYPES = [
  'sedan',
  'suv',
  'hatchback',
  'coupe',
  'pickup',
  'minivan',
  'crossover',
] as const;
export type CarBodyType = (typeof CAR_BODY_TYPES)[number];

export const CAR_STATUS = ['pending', 'approved', 'rejected', 'sold', 'rented', 'expired'] as const;
export type CarStatus = (typeof CAR_STATUS)[number];

/**
 * Optional suggestion list for client make pickers — common makes in the
 * Egyptian market. NOT a server-side enum: `make` accepts any trimmed string.
 */
export const CAR_MAKES = [
  'Abarth',
  'Alfa Romeo',
  'Audi',
  'BAIC',
  'Bentley',
  'Bestune',
  'BMW',
  'Brilliance',
  'BYD',
  'Cadillac',
  'Changan',
  'Chery',
  'Chevrolet',
  'Citroën',
  'Cupra',
  'Daewoo',
  'Daihatsu',
  'DFSK',
  'Dodge',
  'Dongfeng',
  'Exeed',
  'Fiat',
  'Ford',
  'Foton',
  'GAC',
  'Geely',
  'Great Wall',
  'Haval',
  'Honda',
  'Hongqi',
  'Hyundai',
  'Infiniti',
  'Isuzu',
  'JAC',
  'Jaguar',
  'Jeep',
  'Jetour',
  'Kaiyi',
  'KGM',
  'Kia',
  'Lada',
  'Land Rover',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'MG',
  'MINI',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Porsche',
  'Proton',
  'Renault',
  'SEAT',
  'Skoda',
  'Soueast',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
  'Zeekr',
] as const;
export type CarMake = (typeof CAR_MAKES)[number];

// Sensible manufacturing-year bounds shared by validation + UI pickers.
export const MIN_CAR_YEAR = 1950;
