/**
 * Properties Validation Schemas
 * Strict validation matches the 15 fields agreed in the plan.
 */
import { z } from 'zod';
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  FINISHING_TYPES,
  PROPERTY_SERVICES,
  DEPOSIT_OPTIONS,
  PROPERTY_STATUS,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_PROPERTY,
  MIN_LISTING_DURATION_DAYS,
  MAX_LISTING_DURATION_DAYS,
} from '../../config/constants.js';

// Canonical Egyptian WhatsApp number: country code 20 + 10-digit local part
// starting with 1 (e.g. 201070010209). The client form enforces this shape;
// the server re-checks it so the stored number always works on WhatsApp.
const phoneRegex = /^201\d{9}$/;

const imageSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
});

/**
 * Base object schema — kept refinement-free so we can derive a partial
 * version for PATCH. The cross-field "floor required for apartments" rule
 * is applied via .refine() on the create schema below.
 */
const propertyBaseSchema = z.object({
  type: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES),
  category: z.enum(PROPERTY_CATEGORIES),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  floor: z.coerce.number().int().min(-5).max(200).nullable().optional(),
  // Area and price are optional; `null` represents an intentionally omitted value.
  area: z.coerce.number().positive().nullable().optional(),
  finishing: z.enum(FINISHING_TYPES),
  services: z.array(z.enum(PROPERTY_SERVICES)).optional(),
  hasElevator: z.boolean().optional(),
  hasGarage: z.boolean().optional(),
  deposit: z.enum(DEPOSIT_OPTIONS).nullable().optional(),
  // `null` represents an intentionally hidden price ("price on request").
  price: z.coerce.number().positive().nullable().optional(),
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

export const createPropertySchema = propertyBaseSchema.refine(
  (data) => {
    if (data.type === 'apartment') return data.floor !== null && data.floor !== undefined;
    return true;
  },
  { message: 'Floor number is required for apartments', path: ['floor'] }
);

export const updatePropertySchema = propertyBaseSchema.partial();

export const propertyListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  // Cap length to avoid extremely large regex scans across the collection.
  search: z.string().max(100).optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  listingType: z.enum(LISTING_TYPES).optional(),
  category: z.enum(PROPERTY_CATEGORIES).optional(),
  governorate: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minBedrooms: z.coerce.number().int().optional(),
  minArea: z.coerce.number().optional(),
  finishing: z.enum(FINISHING_TYPES).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
  featured: z.coerce.boolean().optional(),
});

export const propertyIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property id'),
});

export const markAsSoldRentedSchema = z.object({
  status: z.enum(['sold', 'rented']),
});

export const reviewPropertySchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.status === 'rejected') return Boolean(data.rejectionReason && data.rejectionReason.trim().length >= 5);
    return true;
  },
  { message: 'A rejection reason (at least 5 chars) is required when rejecting', path: ['rejectionReason'] }
);

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;
