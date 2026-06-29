/**
 * Reports API client
 */
import { http } from '@/shared/api/httpClient';

export const reportsApi = {
  create: (propertyId: string, reason: string, details?: string) =>
    http.post('/reports', { propertyId, reason, details }),
};
