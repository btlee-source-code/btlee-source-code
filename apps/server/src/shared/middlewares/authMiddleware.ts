/**
 * Authentication Middlewares
 * - protect: requires a valid access token (regular users)
 * - adminProtect: requires a valid access token AND admin role
 * - optionalAuth: attaches user if token present, doesn't fail if missing
 *
 * Tokens are read from httpOnly cookies first (the browser flow), falling back
 * to an `Authorization: Bearer` header for non-browser API clients / tests.
 * User and admin sessions use separate cookie names so both can coexist.
 */
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { USER_COOKIES, ADMIN_COOKIES } from '../utils/cookies.js';

export interface AuthPayload {
  userId: string;
  role: 'user' | 'admin';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function extractToken(req: Request, cookieName: string): string | null {
  const fromCookie = (req.cookies as Record<string, string> | undefined)?.[cookieName];
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

function verifyAccess(req: Request, cookieName: string): AuthPayload | null {
  const token = extractToken(req, cookieName);
  if (!token) return null;
  try {
    // Pin HS256 — reject any other algorithm (defends against alg-confusion).
    return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as AuthPayload;
  } catch {
    return null;
  }
}

export function protect(req: Request, _res: Response, next: NextFunction): void {
  const payload = verifyAccess(req, USER_COOKIES.access);
  if (!payload) {
    return next(new UnauthorizedError('Authentication required'));
  }
  req.user = payload;
  next();
}

export function adminProtect(req: Request, _res: Response, next: NextFunction): void {
  const payload = verifyAccess(req, ADMIN_COOKIES.access);
  if (!payload) {
    return next(new UnauthorizedError('Authentication required'));
  }
  if (payload.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  req.user = payload;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const payload = verifyAccess(req, USER_COOKIES.access);
  if (payload) req.user = payload;
  next();
}
