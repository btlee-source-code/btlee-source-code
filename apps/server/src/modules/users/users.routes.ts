/**
 * Users Routes — /api/users/*
 */
import { Router } from 'express';
import * as controller from './users.controller.js';
import { protect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  onboardingSchema,
  userIdParamsSchema,
} from './users.validators.js';

export const usersRouter = Router();

// Authenticated user routes
usersRouter.get('/me', protect, asyncHandler(controller.getMe));
usersRouter.patch(
  '/me',
  protect,
  validate({ body: updateProfileSchema }),
  asyncHandler(controller.updateMe)
);
usersRouter.post(
  '/me/change-password',
  protect,
  validate({ body: changePasswordSchema }),
  asyncHandler(controller.changePassword)
);
usersRouter.post(
  '/me/onboarding',
  protect,
  validate({ body: onboardingSchema }),
  asyncHandler(controller.completeOnboarding)
);

// Public — owner profile page
usersRouter.get(
  '/:userId/public',
  validate({ params: userIdParamsSchema }),
  asyncHandler(controller.getPublicOwner)
);
