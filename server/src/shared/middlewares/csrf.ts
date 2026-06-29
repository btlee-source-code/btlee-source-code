/**
 * CSRF protection for cookie-based auth.
 *
 * Now that auth tokens live in cookies the browser attaches automatically, a
 * malicious site could try to trigger state-changing requests on the user's
 * behalf (CSRF). SameSite=Lax already blocks most of this; verifying the
 * Origin/Referer against our own frontend is defense-in-depth and also covers
 * SameSite=None deployments.
 *
 * Only unsafe methods are checked. If neither Origin nor Referer is present the
 * request is not a browser CSRF vector (e.g. curl, mobile, server-to-server),
 * so it's allowed to proceed to normal authentication.
 */
import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { ForbiddenError } from '../errors/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Same allow-list CORS uses: the primary frontend plus any CORS_EXTRA_ORIGINS
// (www/non-www, preview deployments). Kept in sync so an origin CORS permits
// isn't then blocked here on state-changing requests.
const allowedOrigins = [env.CLIENT_URL, ...(env.CORS_EXTRA_ORIGINS?.split(',') ?? [])]
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

export function verifyOrigin(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  const referer = req.get('referer');

  if (!origin && !referer) return next();

  const source = (origin ?? referer ?? '').replace(/\/$/, '');

  if (allowedOrigins.some((allowed) => source === allowed || source.startsWith(`${allowed}/`))) {
    return next();
  }

  return next(new ForbiddenError('Cross-origin request blocked'));
}
