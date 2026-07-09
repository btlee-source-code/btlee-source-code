/**
 * Properties Controller
 */
import type { Request, Response } from 'express';
import * as service from './properties.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.listProperties(req.query as never);
  res.json(ok(result.items, { pagination: result.meta }));
}

export async function featured(_req: Request, res: Response): Promise<void> {
  const items = await service.getFeatured();
  res.json(ok(items));
}

export async function latest(_req: Request, res: Response): Promise<void> {
  const items = await service.getLatest();
  res.json(ok(items));
}

export async function suggestions(req: Request, res: Response): Promise<void> {
  // Cap length defensively — this endpoint has no body/query validator.
  const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : '';
  const result = await service.getSearchSuggestions(q);
  res.json(ok(result));
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const property = await service.getPropertyById(param(req, 'id'), req.user?.userId);
  res.json(ok(property));
}

export async function similar(req: Request, res: Response): Promise<void> {
  const items = await service.getSimilarProperties(param(req, 'id'));
  res.json(ok(items));
}

export async function byOwner(req: Request, res: Response): Promise<void> {
  const items = await service.getPropertiesByOwner(param(req, 'ownerId'));
  res.json(ok(items));
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const property = await service.createProperty(req.user.userId, req.body);
  res.status(201).json(ok(property));
}

export async function getMine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const items = await service.getMyProperties(req.user.userId);
  res.json(ok(items));
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const property = await service.updateProperty(req.user.userId, param(req, 'id'), req.body);
  res.json(ok(property));
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.deleteProperty(req.user.userId, param(req, 'id'));
  res.json(ok({ message: 'Property deleted' }));
}

export async function markSoldOrRented(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const property = await service.markAsSoldOrRented(req.user.userId, param(req, 'id'), req.body.status);
  res.json(ok(property));
}
