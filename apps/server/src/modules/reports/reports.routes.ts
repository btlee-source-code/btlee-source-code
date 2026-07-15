/**
 * Reports Routes — /api/reports/*
 */
import { Router } from 'express';
import { z } from 'zod';
import * as controller from './reports.controller.js';
import { protect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import { interactionLimiter } from '../../shared/middlewares/rateLimiters.js';
import { REPORT_REASONS } from '../../config/constants.js';

const createSchema = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property id'),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(500).optional(),
});

const createCarSchema = z.object({
  carId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid car id'),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(500).optional(),
});

export const reportsRouter = Router();

reportsRouter.post(
  '/',
  protect,
  interactionLimiter,
  validate({ body: createSchema }),
  asyncHandler(controller.create)
);

reportsRouter.post(
  '/car',
  protect,
  interactionLimiter,
  validate({ body: createCarSchema }),
  asyncHandler(controller.createCar)
);
