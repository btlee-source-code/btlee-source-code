/**
 * Reports Service
 */
import { Types } from 'mongoose';
import { Report } from './report.model.js';
import { Property } from '../properties/property.model.js';
import { Car } from '../cars/car.model.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import type { ReportReason } from '../../config/constants.js';

export async function createReport(
  reporterId: string,
  propertyId: string,
  reason: ReportReason,
  details?: string
) {
  const property = await Property.findById(propertyId);
  if (!property) throw new NotFoundError('Property not found');

  // Prevent report spam: one open report per (reporter, property).
  const existing = await Report.findOne({
    property: new Types.ObjectId(propertyId),
    reporter: new Types.ObjectId(reporterId),
    status: 'open',
  });
  if (existing) {
    throw new ConflictError('لقد قمت بالإبلاغ عن هذا العقار بالفعل');
  }

  const propertyOid = new Types.ObjectId(propertyId);
  return Report.create({
    // Dual-write: legacy `property` + domain-agnostic target.
    property: propertyOid,
    targetType: 'property',
    targetId: propertyOid,
    reporter: new Types.ObjectId(reporterId),
    reason,
    details: details ?? null,
  });
}

/** Report a car listing — domain-agnostic target, no legacy `property` field. */
export async function createCarReport(
  reporterId: string,
  carId: string,
  reason: ReportReason,
  details?: string
) {
  const car = await Car.findById(carId);
  if (!car) throw new NotFoundError('Car not found');

  const carOid = new Types.ObjectId(carId);
  // Prevent report spam: one open report per (reporter, car).
  const existing = await Report.findOne({
    targetType: 'car',
    targetId: carOid,
    reporter: new Types.ObjectId(reporterId),
    status: 'open',
  });
  if (existing) {
    throw new ConflictError('لقد قمت بالإبلاغ عن هذه العربية بالفعل');
  }

  return Report.create({
    targetType: 'car',
    targetId: carOid,
    reporter: new Types.ObjectId(reporterId),
    reason,
    details: details ?? null,
  });
}

export async function listReportsForAdmin(status?: 'open' | 'reviewed' | 'dismissed') {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const reports = await Report.find(filter)
    .populate('property', 'area_name governorate images status')
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // `targetId` carries no populate ref, so hydrate car targets in one query and
  // attach them as `car` — lets the admin see which car a report is about.
  const carIds = reports
    .filter((r) => r.targetType === 'car' && r.targetId)
    .map((r) => r.targetId);
  if (carIds.length) {
    const cars = await Car.find({ _id: { $in: carIds } })
      .select('make model year images status')
      .lean();
    const byId = new Map(cars.map((c) => [String(c._id), c]));
    for (const r of reports) {
      if (r.targetType === 'car' && r.targetId) {
        (r as Record<string, unknown>).car = byId.get(String(r.targetId)) ?? null;
      }
    }
  }
  return reports;
}

export async function updateReportStatus(
  id: string,
  status: 'reviewed' | 'dismissed'
) {
  const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
  if (!report) throw new NotFoundError('Report not found');
  return report;
}
