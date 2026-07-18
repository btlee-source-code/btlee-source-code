/**
 * Admins Controller
 */
import type { Request, Response } from 'express';
import * as adminsService from './admins.service.js';
import * as propertiesService from '../properties/properties.service.js';
import * as carsService from '../cars/cars.service.js';
import * as reportsService from '../reports/reports.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';

export async function dashboard(_req: Request, res: Response): Promise<void> {
  const stats = await adminsService.getDashboardStats();
  res.json(ok(stats));
}

export async function listProperties(req: Request, res: Response): Promise<void> {
  const result = await propertiesService.adminListProperties(req.query as never);
  res.json(ok(result.items, { pagination: result.meta }));
}

export async function reviewProperty(req: Request, res: Response): Promise<void> {
  const property = await propertiesService.reviewProperty(
    param(req, 'id'),
    req.body.status,
    req.body.rejectionReason
  );
  res.json(ok(property));
}

export async function setFeatured(req: Request, res: Response): Promise<void> {
  const property = await propertiesService.setFeatured(param(req, 'id'), req.body.isFeatured);
  res.json(ok(property));
}

export async function deleteProperty(req: Request, res: Response): Promise<void> {
  await propertiesService.adminDeleteProperty(param(req, 'id'));
  res.json(ok({ message: 'Property deleted' }));
}

export async function bulkDeleteProperties(req: Request, res: Response): Promise<void> {
  const result = await propertiesService.adminBulkDeleteProperties(req.body.ids);
  res.json(ok({ deletedCount: result.deletedCount }));
}

// ── Cars management (mirrors the property handlers, delegating to carsService) ──

export async function listCars(req: Request, res: Response): Promise<void> {
  const result = await carsService.adminListCars(req.query as never);
  res.json(ok(result.items, { pagination: result.meta }));
}

export async function reviewCar(req: Request, res: Response): Promise<void> {
  const car = await carsService.reviewCar(
    param(req, 'id'),
    req.body.status,
    req.body.rejectionReason
  );
  res.json(ok(car));
}

export async function setCarFeatured(req: Request, res: Response): Promise<void> {
  const car = await carsService.setFeatured(param(req, 'id'), req.body.isFeatured);
  res.json(ok(car));
}

export async function deleteCar(req: Request, res: Response): Promise<void> {
  await carsService.adminDeleteCar(param(req, 'id'));
  res.json(ok({ message: 'Car deleted' }));
}

export async function bulkDeleteCars(req: Request, res: Response): Promise<void> {
  const result = await carsService.adminBulkDeleteCars(req.body.ids);
  res.json(ok({ deletedCount: result.deletedCount }));
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const result = await adminsService.listUsers(page, limit, search);
  const totalPages = Math.max(1, Math.ceil(result.total / limit));
  res.json(ok(result.items, { pagination: { page, limit, total: result.total, totalPages } }));
}

export async function blockUser(req: Request, res: Response): Promise<void> {
  const user = await adminsService.blockUser(param(req, 'userId'), req.body.isBlocked);
  res.json(ok(user));
}

export async function listReports(req: Request, res: Response): Promise<void> {
  const status = req.query.status as 'open' | 'reviewed' | 'dismissed' | undefined;
  const items = await reportsService.listReportsForAdmin(status);
  res.json(ok(items));
}

export async function updateReport(req: Request, res: Response): Promise<void> {
  const report = await reportsService.updateReportStatus(param(req, 'id'), req.body.status);
  res.json(ok(report));
}
