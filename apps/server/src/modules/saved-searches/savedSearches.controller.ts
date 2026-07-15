/**
 * Saved Searches Controller
 */
import type { Request, Response } from 'express';
import * as service from './savedSearches.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const t = req.query.targetType;
  const targetType = t === 'car' || t === 'property' ? t : undefined;
  const items = await service.getMySavedSearches(req.user.userId, targetType);
  res.json(ok(items));
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const item = await service.createSavedSearch(req.user.userId, req.body);
  res.status(201).json(ok(item));
}

export async function createCar(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const item = await service.createCarSavedSearch(req.user.userId, req.body);
  res.status(201).json(ok(item));
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.deleteSavedSearch(req.user.userId, param(req, 'id'));
  res.json(ok({ message: 'Saved search deleted' }));
}
