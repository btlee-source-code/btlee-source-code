/**
 * Saved Searches Routes — /api/saved-searches/*
 */
import { Router } from 'express';
import { z } from 'zod';
import * as controller from './savedSearches.controller.js';
import { protect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  CAR_CONDITIONS,
  CAR_BODY_TYPES,
  CAR_FUEL_TYPES,
  CAR_TRANSMISSIONS,
} from '../../config/constants.js';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  search: z.string().nullable().optional(),
  type: z.enum(PROPERTY_TYPES).nullable().optional(),
  listingType: z.enum(LISTING_TYPES).nullable().optional(),
  category: z.enum(PROPERTY_CATEGORIES).nullable().optional(),
  governorate: z.string().nullable().optional(),
  minPrice: z.number().nullable().optional(),
  maxPrice: z.number().nullable().optional(),
  minBedrooms: z.number().int().nullable().optional(),
  minArea: z.number().nullable().optional(),
});

const createCarSchema = z.object({
  name: z.string().min(1).max(100),
  search: z.string().nullable().optional(),
  listingType: z.enum(LISTING_TYPES).nullable().optional(),
  governorate: z.string().nullable().optional(),
  minPrice: z.number().nullable().optional(),
  maxPrice: z.number().nullable().optional(),
  condition: z.enum(CAR_CONDITIONS).nullable().optional(),
  bodyType: z.enum(CAR_BODY_TYPES).nullable().optional(),
  fuelType: z.enum(CAR_FUEL_TYPES).nullable().optional(),
  transmission: z.enum(CAR_TRANSMISSIONS).nullable().optional(),
  minYear: z.number().int().nullable().optional(),
  maxYear: z.number().int().nullable().optional(),
  maxMileage: z.number().nullable().optional(),
});

const idParams = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
});

export const savedSearchesRouter = Router();

savedSearchesRouter.get('/', protect, asyncHandler(controller.list));
savedSearchesRouter.post(
  '/',
  protect,
  validate({ body: createSchema }),
  asyncHandler(controller.create)
);
savedSearchesRouter.post(
  '/car',
  protect,
  validate({ body: createCarSchema }),
  asyncHandler(controller.createCar)
);
savedSearchesRouter.delete(
  '/:id',
  protect,
  validate({ params: idParams }),
  asyncHandler(controller.remove)
);
