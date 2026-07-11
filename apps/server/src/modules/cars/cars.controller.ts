/**
 * Cars Controller — thin HTTP adapters over the cars service.
 */
import type { Request, Response } from 'express';
import * as service from './cars.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.listCars(req.query as never);
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

export async function getOne(req: Request, res: Response): Promise<void> {
  const car = await service.getCarById(param(req, 'id'), req.user?.userId);
  res.json(ok(car));
}

export async function similar(req: Request, res: Response): Promise<void> {
  const items = await service.getSimilarCars(param(req, 'id'));
  res.json(ok(items));
}

export async function byOwner(req: Request, res: Response): Promise<void> {
  const items = await service.getCarsByOwner(param(req, 'ownerId'));
  res.json(ok(items));
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const car = await service.createCar(req.user.userId, req.body);
  res.status(201).json(ok(car));
}

export async function getMine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const items = await service.getMyCars(req.user.userId);
  res.json(ok(items));
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const car = await service.updateCar(req.user.userId, param(req, 'id'), req.body);
  res.json(ok(car));
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  await service.deleteCar(req.user.userId, param(req, 'id'));
  res.json(ok({ message: 'Car deleted' }));
}

export async function markSoldOrRented(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const car = await service.markAsSoldOrRented(req.user.userId, param(req, 'id'), req.body.status);
  res.json(ok(car));
}
