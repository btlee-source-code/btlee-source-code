/**
 * Reports Controller
 */
import type { Request, Response } from 'express';
import * as service from './reports.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const report = await service.createReport(
    req.user.userId,
    req.body.propertyId,
    req.body.reason,
    req.body.details
  );
  res.status(201).json(ok(report));
}
