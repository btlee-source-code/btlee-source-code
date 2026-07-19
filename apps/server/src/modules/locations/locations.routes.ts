import { Router } from 'express';

import { protect } from '../../shared/middlewares/authMiddleware.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import { locationSearchLimiter } from '../../shared/middlewares/rateLimiters.js';
import { validate } from '../../shared/middlewares/validate.js';
import * as controller from './locations.controller.js';
import { locationSearchQuerySchema } from './locations.validators.js';

export const locationsRouter = Router();

locationsRouter.get(
  '/search',
  protect,
  locationSearchLimiter,
  validate({ query: locationSearchQuerySchema }),
  asyncHandler(controller.search)
);
