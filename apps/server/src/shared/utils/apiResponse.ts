/**
 * Standardized API response shapes for consistent client consumption.
 */

export interface SuccessResponse<T> {
  status: 'success';
  data: T;
  meta?: Record<string, unknown>;
}

export function ok<T>(data: T, meta?: Record<string, unknown>): SuccessResponse<T> {
  const response: SuccessResponse<T> = { status: 'success', data };
  if (meta) response.meta = meta;
  return response;
}
