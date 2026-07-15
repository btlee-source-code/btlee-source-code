/**
 * Cars Routes — /api/cars/*
 * Mirrors the properties routes: public browse + owner-only management.
 */
import { Router } from 'express';
import { z } from 'zod';
import * as controller from './cars.controller.js';
import { protect, optionalAuth } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import { createListingLimiter } from '../../shared/middlewares/rateLimiters.js';
import {
  createCarSchema,
  updateCarSchema,
  carListQuerySchema,
  carIdParamsSchema,
  markAsSoldRentedSchema,
} from './cars.validators.js';

export const carsRouter = Router();

const ownerIdParams = z.object({
  ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid owner id'),
});

// Public listings — anyone can browse
carsRouter.get('/', validate({ query: carListQuerySchema }), asyncHandler(controller.list));
carsRouter.get('/featured', asyncHandler(controller.featured));
carsRouter.get('/latest', asyncHandler(controller.latest));

// Authenticated user — must be before the /:id route to avoid clashing
carsRouter.get('/mine', protect, asyncHandler(controller.getMine));

// Specific car detail
carsRouter.get(
  '/:id',
  optionalAuth,
  validate({ params: carIdParamsSchema }),
  asyncHandler(controller.getOne)
);
carsRouter.get(
  '/:id/similar',
  validate({ params: carIdParamsSchema }),
  asyncHandler(controller.similar)
);

// Public owner listings
carsRouter.get(
  '/by-owner/:ownerId',
  validate({ params: ownerIdParams }),
  asyncHandler(controller.byOwner)
);

// Create + manage listing (owner only)
carsRouter.post('/', protect, createListingLimiter, validate({ body: createCarSchema }), asyncHandler(controller.create));
carsRouter.patch(
  '/:id',
  protect,
  validate({ params: carIdParamsSchema, body: updateCarSchema }),
  asyncHandler(controller.update)
);
carsRouter.delete(
  '/:id',
  protect,
  validate({ params: carIdParamsSchema }),
  asyncHandler(controller.remove)
);
carsRouter.post(
  '/:id/mark',
  protect,
  validate({ params: carIdParamsSchema, body: markAsSoldRentedSchema }),
  asyncHandler(controller.markSoldOrRented)
);
