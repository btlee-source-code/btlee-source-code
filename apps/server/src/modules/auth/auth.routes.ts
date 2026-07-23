/**
 * Auth Routes — /api/auth/*
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './auth.controller.js';
import * as oauthController from './oauth/oauth.controller.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  oauthMobileExchangeSchema,
} from './auth.validators.js';

// Stricter limit for auth endpoints — protects against brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 'error', message: 'Too many attempts. Try again later.' },
});

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(controller.register)
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(controller.login)
);

// Social login (Google). Full-page browser redirects, not JSON. The callback is
// GET so the CSRF origin check (unsafe-methods only) lets it through; the
// `state` cookie+param pair is what protects this flow against login-CSRF.
authRouter.get('/google', oauthController.googleRedirect);
authRouter.get('/google/callback', asyncHandler(oauthController.googleCallback));
authRouter.post(
  '/google/mobile-exchange',
  authLimiter,
  validate({ body: oauthMobileExchangeSchema }),
  asyncHandler(oauthController.exchangeMobileCode)
);

// Refresh + logout read the token from the httpOnly cookie — no body needed.
// Rate-limited too, so a stolen/guessed cookie can't be hammered.
authRouter.post('/refresh', authLimiter, asyncHandler(controller.refresh));

authRouter.post('/logout', asyncHandler(controller.logout));

authRouter.post(
  '/forgot-password',
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(controller.forgotPassword)
);

authRouter.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(controller.resetPassword)
);
