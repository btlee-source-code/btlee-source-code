/**
 * Notifications Routes — /api/notifications/*
 */
import { Router } from 'express';
import { z } from 'zod';
import * as controller from './notifications.controller.js';
import { protect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';

const idParams = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
});

export const notificationsRouter = Router();

notificationsRouter.get('/', protect, asyncHandler(controller.list));
notificationsRouter.get('/unread-count', protect, asyncHandler(controller.unreadCount));
notificationsRouter.post(
  '/:id/read',
  protect,
  validate({ params: idParams }),
  asyncHandler(controller.markRead)
);
notificationsRouter.post('/read-all', protect, asyncHandler(controller.markAllRead));
