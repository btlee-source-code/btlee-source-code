/**
 * Auth cookie helpers.
 *
 * Tokens are delivered to the browser as httpOnly cookies (not in the JSON
 * body), so client-side JavaScript can never read them. This neutralizes
 * token theft via XSS — the #1 risk of the previous localStorage approach.
 *
 * Flags applied to every auth cookie:
 *   - httpOnly: not readable from JS
 *   - secure:   HTTPS-only (always in production, and whenever SameSite=None)
 *   - sameSite: 'lax' by default — the browser won't attach the cookie to
 *               cross-site POST/PUT/PATCH/DELETE, which blocks most CSRF
 *   - path '/': sent to the whole API
 *
 * User and admin sessions use different cookie names so both can be active in
 * the same browser simultaneously (mirrors the old two-store setup).
 */
import type { CookieOptions, Response } from 'express';
import { env } from '../../config/env.js';

export interface CookieNames {
  access: string;
  refresh: string;
}

export const USER_COOKIES: CookieNames = {
  access: 'access_token',
  refresh: 'refresh_token',
};

export const ADMIN_COOKIES: CookieNames = {
  access: 'admin_access_token',
  refresh: 'admin_refresh_token',
};

const isProd = env.NODE_ENV === 'production';
// SameSite=None requires Secure per the spec; otherwise Secure in prod only.
const secure = isProd || env.COOKIE_SAMESITE === 'none';

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite: env.COOKIE_SAMESITE,
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

/** Convert a JWT-style duration ('15m', '30d', '900s', '12h') to milliseconds. */
function durationToMs(value: string, fallbackMs: number): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * multipliers[unit];
}

const ACCESS_MAX_AGE = durationToMs(env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000);
const REFRESH_MAX_AGE = durationToMs(env.JWT_REFRESH_EXPIRES_IN, 30 * 24 * 60 * 60 * 1000);

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  names: CookieNames
): void {
  res.cookie(names.access, tokens.accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE });
  res.cookie(names.refresh, tokens.refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE });
}

export function clearAuthCookies(res: Response, names: CookieNames): void {
  // clearCookie must use the same flags (path/domain/sameSite/secure) it was set with.
  res.clearCookie(names.access, baseOptions);
  res.clearCookie(names.refresh, baseOptions);
}
