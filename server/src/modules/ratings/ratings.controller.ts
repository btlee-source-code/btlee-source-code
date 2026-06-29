/**
 * Ratings Controller
 */
import type { Request, Response } from 'express';
import * as service from './ratings.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function rate(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const result = await service.rateProperty(
    req.user.userId,
    param(req, 'propertyId'),
    req.body.value
  );
  res.json(ok(result));
}

export async function mine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const myRating = await service.getMyRating(req.user.userId, param(req, 'propertyId'));
  res.json(ok({ myRating }));
}
