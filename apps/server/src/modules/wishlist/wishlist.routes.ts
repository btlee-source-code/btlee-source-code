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

const carIdParams = z.object({
  carId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid car id'),
});

export const wishlistRouter = Router();

// --- Cars (parallel array) — declared before the `/:propertyId` catch-alls so
// the literal `/cars` segment isn't captured as a property id. ---
wishlistRouter.get('/cars', protect, asyncHandler(controller.getCars));
wishlistRouter.post(
  '/cars/:carId',
  protect,
  validate({ params: carIdParams }),
  asyncHandler(controller.addCar)
);
wishlistRouter.delete(
  '/cars/:carId',
  protect,
  validate({ params: carIdParams }),
  asyncHandler(controller.removeCar)
);
wishlistRouter.get(
  '/cars/:carId/check',
  protect,
  validate({ params: carIdParams }),
  asyncHandler(controller.checkCar)
);

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
