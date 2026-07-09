/**
 * Properties Routes — /api/properties/*
 */
import { Router } from 'express';
import * as controller from './properties.controller.js';
import { protect, optionalAuth } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyListQuerySchema,
  propertyIdParamsSchema,
  markAsSoldRentedSchema,
} from './properties.validators.js';
import { z } from 'zod';

export const propertiesRouter = Router();

const ownerIdParams = z.object({
  ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid owner id'),
});

// Public listings — anyone can browse
propertiesRouter.get(
  '/',
  validate({ query: propertyListQuerySchema }),
  asyncHandler(controller.list)
);
propertiesRouter.get('/featured', asyncHandler(controller.featured));
propertiesRouter.get('/latest', asyncHandler(controller.latest));
propertiesRouter.get('/suggestions', asyncHandler(controller.suggestions));

// Authenticated user — must be before the /:id route to avoid clashing
propertiesRouter.get('/mine', protect, asyncHandler(controller.getMine));

// Specific property detail
propertiesRouter.get(
  '/:id',
  optionalAuth,
  validate({ params: propertyIdParamsSchema }),
  asyncHandler(controller.getOne)
);
propertiesRouter.get(
  '/:id/similar',
  validate({ params: propertyIdParamsSchema }),
  asyncHandler(controller.similar)
);

// Public owner listings
propertiesRouter.get(
  '/by-owner/:ownerId',
  validate({ params: ownerIdParams }),
  asyncHandler(controller.byOwner)
);

// Create + manage listing (owner only)
propertiesRouter.post(
  '/',
  protect,
  validate({ body: createPropertySchema }),
  asyncHandler(controller.create)
);
propertiesRouter.patch(
  '/:id',
  protect,
  validate({ params: propertyIdParamsSchema, body: updatePropertySchema }),
  asyncHandler(controller.update)
);
propertiesRouter.delete(
  '/:id',
  protect,
  validate({ params: propertyIdParamsSchema }),
  asyncHandler(controller.remove)
);
propertiesRouter.post(
  '/:id/mark',
  protect,
  validate({ params: propertyIdParamsSchema, body: markAsSoldRentedSchema }),
  asyncHandler(controller.markSoldOrRented)
);
