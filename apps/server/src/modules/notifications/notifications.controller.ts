/**
 * Notifications Controller
 */
import type { Request, Response } from 'express';
import * as service from './notifications.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const [items, unreadCount] = await Promise.all([
    service.getMyNotifications(req.user.userId),
    service.getUnreadCount(req.user.userId),
  ]);
  res.json(ok(items, { unreadCount }));
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const count = await service.getUnreadCount(req.user.userId);
  res.json(ok({ unreadCount: count }));
}

export async function markRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.markAsRead(req.user.userId, param(req, 'id'));
  res.json(ok({ message: 'Marked as read' }));
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.markAllAsRead(req.user.userId);
  res.json(ok({ message: 'All marked as read' }));
}

export async function registerPushToken(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.registerPushToken(req.user.userId, req.body.token);
  res.json(ok({ message: 'Push token registered' }));
}

export async function unregisterPushToken(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.unregisterPushToken(req.user.userId, req.body.token);
  res.json(ok({ message: 'Push token removed' }));
}
