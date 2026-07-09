/**
 * Shared API response types.
 */

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
