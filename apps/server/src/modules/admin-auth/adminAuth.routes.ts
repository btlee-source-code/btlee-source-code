/**
 * Admin Auth Routes — /api/admin/auth/*
 */
import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import * as controller from './adminAuth.controller.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many attempts. Try again later.' },
});

export const adminAuthRouter = Router();

adminAuthRouter.post(
  '/login',
  limiter,
  validate({ body: loginSchema }),
  asyncHandler(controller.login)
);

// Token read from the admin httpOnly cookie — rate-limited, no body needed.
adminAuthRouter.post('/refresh', limiter, asyncHandler(controller.refresh));

adminAuthRouter.post('/logout', asyncHandler(controller.logout));
