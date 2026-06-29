/**
 * Wishlist Routes — /api/wishlist/*
 */
import { Router } from 'express';
import { z } from 'zod';
import * as controller from './wishlist.controller.js';
import { protect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';

const propertyIdParams = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property id'),
});

export const wishlistRouter = Router();

wishlistRouter.get('/', protect, asyncHandler(controller.get));
wishlistRouter.post(
  '/:propertyId',
  protect,
  validate({ params: propertyIdParams }),
  asyncHandler(controller.add)
);
wishlistRouter.delete(
  '/:propertyId',
  protect,
  validate({ params: propertyIdParams }),
  asyncHandler(controller.remove)
);
wishlistRouter.get(
  '/:propertyId/check',
  protect,
  validate({ params: propertyIdParams }),
  asyncHandler(controller.check)
);
