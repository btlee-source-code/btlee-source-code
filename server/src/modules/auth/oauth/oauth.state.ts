/**
 * OAuth `state` parameter — CSRF protection for the social-login flow.
 *
 * We generate a random value, stash it in a short-lived httpOnly cookie, and
 * also send it to the provider as `state`. When the provider redirects back we
 * require the `state` query param to equal the cookie. An attacker who can't
 * read our cookie can't forge a matching state, which blocks login-CSRF.
 */
import crypto from 'node:crypto';
import type { Response } from 'express';
import { env } from '../../../config/env.js';

export const OAUTH_STATE_COOKIE = 'oauth_state';

const isProd = env.NODE_ENV === 'production';
const secure = isProd || env.COOKIE_SAMESITE === 'none';

export function createState(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setStateCookie(res: Response, state: string): void {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    // The provider redirect is a top-level cross-site GET navigation, so the
    // cookie must be allowed to ride along on it. 'lax' permits top-level GET
    // navigations (unlike 'strict'); fall back to the configured value otherwise.
    sameSite: env.COOKIE_SAMESITE === 'strict' ? 'lax' : env.COOKIE_SAMESITE,
    path: '/',
    maxAge: 10 * 60 * 1000, // 10 minutes — the user must finish consent in time
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  });
}

export function clearStateCookie(res: Response): void {
  res.clearCookie(OAUTH_STATE_COOKIE, {
    httpOnly: true,
    secure,
    sameSite: env.COOKIE_SAMESITE === 'strict' ? 'lax' : env.COOKIE_SAMESITE,
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  });
}

/** Constant-time compare to avoid leaking timing info on the state check. */
export function isValidState(fromCookie: unknown, fromQuery: unknown): boolean {
  if (typeof fromCookie !== 'string' || typeof fromQuery !== 'string') return false;
  if (fromCookie.length === 0 || fromCookie.length !== fromQuery.length) return false;
  return crypto.timingSafeEqual(Buffer.from(fromCookie), Buffer.from(fromQuery));
}
