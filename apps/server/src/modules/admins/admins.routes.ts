/**
 * Admin Routes — /api/admin/*
 * All routes require admin authentication.
 */
import { Router } from 'express';
import { z } from 'zod';
import * as controller from './admins.controller.js';
import { adminProtect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import {
  propertyListQuerySchema,
  propertyIdParamsSchema,
  reviewPropertySchema,
} from '../properties/properties.validators.js';
import {
  carListQuerySchema,
  carIdParamsSchema,
  reviewCarSchema,
} from '../cars/cars.validators.js';

const userIdParams = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id'),
});
const idParams = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') });

const blockSchema = z.object({ isBlocked: z.boolean() });
const featuredSchema = z.object({ isFeatured: z.boolean() });
const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'))
    .min(1, 'Select at least one property')
    .max(100, 'Cannot delete more than 100 at once'),
});
const reportUpdateSchema = z.object({ status: z.enum(['reviewed', 'dismissed']) });

export const adminsRouter = Router();

adminsRouter.get('/dashboard', adminProtect, asyncHandler(controller.dashboard));

// Properties management
adminsRouter.get(
  '/properties',
  adminProtect,
  validate({ query: propertyListQuerySchema.extend({ status: z.string().optional() }) }),
  asyncHandler(controller.listProperties)
);
adminsRouter.post(
  '/properties/:id/review',
  adminProtect,
  validate({ params: propertyIdParamsSchema, body: reviewPropertySchema }),
  asyncHandler(controller.reviewProperty)
);
adminsRouter.post(
  '/properties/:id/featured',
  adminProtect,
  validate({ params: propertyIdParamsSchema, body: featuredSchema }),
  asyncHandler(controller.setFeatured)
);
adminsRouter.post(
  '/properties/bulk-delete',
  adminProtect,
  validate({ body: bulkDeleteSchema }),
  asyncHandler(controller.bulkDeleteProperties)
);
adminsRouter.delete(
  '/properties/:id',
  adminProtect,
  validate({ params: propertyIdParamsSchema }),
  asyncHandler(controller.deleteProperty)
);

// Cars management (mirrors the properties block)
adminsRouter.get(
  '/cars',
  adminProtect,
  validate({ query: carListQuerySchema.extend({ status: z.string().optional() }) }),
  asyncHandler(controller.listCars)
);
adminsRouter.post(
  '/cars/:id/review',
  adminProtect,
  validate({ params: carIdParamsSchema, body: reviewCarSchema }),
  asyncHandler(controller.reviewCar)
);
adminsRouter.post(
  '/cars/:id/featured',
  adminProtect,
  validate({ params: carIdParamsSchema, body: featuredSchema }),
  asyncHandler(controller.setCarFeatured)
);
adminsRouter.post(
  '/cars/bulk-delete',
  adminProtect,
  validate({ body: bulkDeleteSchema }),
  asyncHandler(controller.bulkDeleteCars)
);
adminsRouter.delete(
  '/cars/:id',
  adminProtect,
  validate({ params: carIdParamsSchema }),
  asyncHandler(controller.deleteCar)
);

// Users management
adminsRouter.get('/users', adminProtect, asyncHandler(controller.listUsers));
adminsRouter.post(
  '/users/:userId/block',
  adminProtect,
  validate({ params: userIdParams, body: blockSchema }),
  asyncHandler(controller.blockUser)
);

// Reports
adminsRouter.get(
  '/reports',
  adminProtect,
  // Validate `status` to an enum so a crafted `?status[$ne]=open` can't reach the
  // Mongo filter as an operator object (NoSQL-injection defense).
  validate({ query: z.object({ status: z.enum(['open', 'reviewed', 'dismissed']).optional() }) }),
  asyncHandler(controller.listReports)
);
adminsRouter.patch(
  '/reports/:id',
  adminProtect,
  validate({ params: idParams, body: reportUpdateSchema }),
  asyncHandler(controller.updateReport)
);
