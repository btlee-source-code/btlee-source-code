/**
 * Helper: read a route param as a guaranteed string.
 * Express 5 types params as `string | string[]` (matrix-param support),
 * but our routes never use repeated params — this normalizes the access.
 */
import type { Request } from 'express';

export function param<K extends string>(req: Request, key: K): string {
  const value = req.params[key];
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}
