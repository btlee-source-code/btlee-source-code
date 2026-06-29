/**
 * Wishlist Controller
 */
import type { Request, Response } from 'express';
import * as service from './wishlist.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function get(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const items = await service.getWishlist(req.user.userId);
  res.json(ok(items));
}

export async function add(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.addToWishlist(req.user.userId, param(req, 'propertyId'));
  res.status(201).json(ok({ message: 'Added to wishlist' }));
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.removeFromWishlist(req.user.userId, param(req, 'propertyId'));
  res.json(ok({ message: 'Removed from wishlist' }));
}

export async function check(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const inWishlist = await service.isInWishlist(req.user.userId, param(req, 'propertyId'));
  res.json(ok({ inWishlist }));
}
