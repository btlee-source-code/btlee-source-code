/**
 * Ratings Routes — /api/ratings/*
 */
import { Router } from 'express';
import { z } from 'zod';
import * as controller from './ratings.controller.js';
import { protect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';

const propertyIdParams = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property id'),
});

const rateBody = z.object({
  value: z.coerce.number().int().min(1).max(5),
});

export const ratingsRouter = Router();

// Submit (or update) the current user's rating for a property.
ratingsRouter.post(
  '/:propertyId',
  protect,
  validate({ params: propertyIdParams, body: rateBody }),
  asyncHandler(controller.rate)
);

// The current user's existing rating for a property (null if none).
ratingsRouter.get(
  '/:propertyId/me',
  protect,
  validate({ params: propertyIdParams }),
  asyncHandler(controller.mine)
);
