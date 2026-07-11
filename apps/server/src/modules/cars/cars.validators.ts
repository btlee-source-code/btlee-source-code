/**
 * Cars Validation Schemas
 * Mirrors the property validators: a refinement-free base object (so PATCH can
 * derive a `.partial()` version) plus the list-query and params schemas.
 */
import { z } from 'zod';
import {
  CAR_LISTING_TYPES,
  CAR_CONDITIONS,
  CAR_TRANSMISSIONS,
  CAR_FUEL_TYPES,
  CAR_BODY_TYPES,
  MIN_CAR_YEAR,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_PROPERTY,
  MIN_LISTING_DURATION_DAYS,
  MAX_LISTING_DURATION_DAYS,
} from '../../config/constants.js';

// Canonical Egyptian WhatsApp number: country code 20 + 10-digit local part
// starting with 1 (e.g. 201070010209). Same shape as the property domain.
const phoneRegex = /^201\d{9}$/;

// Accept next model year (cars ship ahead of the calendar).
const MAX_CAR_YEAR = new Date().getFullYear() + 1;

const imageSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
});

const carBaseSchema = z.object({
  listingType: z.enum(CAR_LISTING_TYPES),
  condition: z.enum(CAR_CONDITIONS),
  make: z.string().min(1).max(40),
  model: z.string().min(1).max(60),
  year: z.coerce.number().int().min(MIN_CAR_YEAR).max(MAX_CAR_YEAR),
  // Mileage optional — a brand-new car may omit it (treated as 0 km).
  mileage: z.coerce.number().int().min(0).max(2_000_000).nullable().optional(),
  transmission: z.enum(CAR_TRANSMISSIONS),
  fuelType: z.enum(CAR_FUEL_TYPES),
  bodyType: z.enum(CAR_BODY_TYPES),
  color: z.string().max(30).nullable().optional(),
  // Price optional — owners may list without disclosing it.
  price: z.coerce.number().positive().optional(),
  governorate: z.string().min(1).max(60),
  area_name: z.string().min(1).max(120),
  // Map location is optional — the owner may skip pinning it.
  coordinates: z
    .tuple([
      z.coerce.number().min(-180).max(180), // longitude
      z.coerce.number().min(-90).max(90), // latitude
    ])
    .optional(),
  description: z.string().min(10).max(MAX_DESCRIPTION_LENGTH),
  images: z.array(imageSchema).min(1, 'At least 1 image required').max(MAX_IMAGES_PER_PROPERTY),
  whatsappNumber: z.string().regex(phoneRegex, 'Invalid WhatsApp number'),
  durationDays: z.coerce
    .number()
    .int()
    .min(MIN_LISTING_DURATION_DAYS)
    .max(MAX_LISTING_DURATION_DAYS),
});

export const createCarSchema = carBaseSchema;
export const updateCarSchema = carBaseSchema.partial();

export const carListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  // Cap length to avoid extremely large regex scans across the collection.
  search: z.string().max(100).optional(),
  listingType: z.enum(CAR_LISTING_TYPES).optional(),
  condition: z.enum(CAR_CONDITIONS).optional(),
  make: z.string().max(40).optional(),
  bodyType: z.enum(CAR_BODY_TYPES).optional(),
  fuelType: z.enum(CAR_FUEL_TYPES).optional(),
  transmission: z.enum(CAR_TRANSMISSIONS).optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  maxMileage: z.coerce.number().optional(),
  governorate: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
  featured: z.coerce.boolean().optional(),
});

export const carIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid car id'),
});

export const markAsSoldRentedSchema = z.object({
  status: z.enum(['sold', 'rented']),
});

// Admin review (approve/reject). A rejection reason (≥5 chars) is required when
// rejecting — same contract as the property domain.
export const reviewCarSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'rejected') {
        return Boolean(data.rejectionReason && data.rejectionReason.trim().length >= 5);
      }
      return true;
    },
    { message: 'A rejection reason (at least 5 chars) is required when rejecting', path: ['rejectionReason'] }
  );

export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
export type CarListQuery = z.infer<typeof carListQuerySchema>;
