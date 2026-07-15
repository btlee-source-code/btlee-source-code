import { post } from '@/shared/api/httpClient';
import type { ReportReason } from '@/shared/lib/constants';

export interface ReportInput {
  propertyId: string;
  reason: ReportReason;
  details?: string;
}

export interface CarReportInput {
  carId: string;
  reason: ReportReason;
  details?: string;
}

/**
 * Reports API — mirrors the web `reports.api.ts`. Reporting the same listing
 * twice returns HTTP 409 with an Arabic message (surface `HttpError.message`).
 */
export const reportsApi = {
  create: (body: ReportInput) => post<{ _id: string }>('/reports', body),
  createCar: (body: CarReportInput) => post<{ _id: string }>('/reports/car', body),
};
