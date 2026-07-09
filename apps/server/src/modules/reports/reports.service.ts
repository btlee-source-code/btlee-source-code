/**
 * Reports Service
 */
import { Types } from 'mongoose';
import { Report } from './report.model.js';
import { Property } from '../properties/property.model.js';
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

  return Report.create({
    property: new Types.ObjectId(propertyId),
    reporter: new Types.ObjectId(reporterId),
    reason,
    details: details ?? null,
  });
}

export async function listReportsForAdmin(status?: 'open' | 'reviewed' | 'dismissed') {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  return Report.find(filter)
    .populate('property', 'area_name governorate images status')
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 })
    .lean();
}

export async function updateReportStatus(
  id: string,
  status: 'reviewed' | 'dismissed'
) {
  const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
  if (!report) throw new NotFoundError('Report not found');
  return report;
}
