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
/** Mobile-only: where to hand the browser back to (an app deep link) after the flow. */
export const OAUTH_RETURN_COOKIE = 'oauth_return';

/**
 * Prefix marking a mobile flow. The web flow uses a plain random `state`
 * validated against a cookie (double-submit). The mobile flow instead SIGNS the
 * return deep-link into the state itself, so the callback needs no cookie —
 * cookies are unreliable across the in-app-browser → Google → callback round
 * trip (cross-site redirects, Custom Tabs, a mismatched COOKIE_DOMAIN can all
 * drop them, which silently sent the user to the website instead of the app).
 */
export const MOBILE_STATE_PREFIX = 'm.';

const isProd = env.NODE_ENV === 'production';
const secure = isProd || env.COOKIE_SAMESITE === 'none';
const sameSite = env.COOKIE_SAMESITE === 'strict' ? 'lax' : env.COOKIE_SAMESITE;
const cookieBase = {
  httpOnly: true,
  secure,
  sameSite,
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
} as const;

export function createState(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function isMobileState(s: unknown): boolean {
  return typeof s === 'string' && s.startsWith(MOBILE_STATE_PREFIX);
}

// HMAC key for signed mobile states. It's a server-only signing key (never
// leaves the process), so reusing the existing access secret is safe here.
const STATE_SIGNING_KEY = env.JWT_ACCESS_SECRET;

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', STATE_SIGNING_KEY).update(payload).digest('base64url');
}

/**
 * Mobile flow: encode the app's return deep-link into a SIGNED state so the
 * callback can recover it without any cookie. Shape: `m.<payloadB64>.<hmacB64>`.
 * The HMAC proves we minted it (CSRF protection), and a random nonce keeps every
 * state unique. Google echoes `state` back verbatim, so this survives reliably.
 */
export function createMobileState(returnUrl: string, useCodeExchange = false): string {
  const payload = Buffer.from(
    JSON.stringify({
      r: returnUrl,
      n: crypto.randomBytes(16).toString('hex'),
      ...(useCodeExchange ? { v: 2 } : {}),
    })
  ).toString('base64url');
  return `${MOBILE_STATE_PREFIX}${payload}.${signPayload(payload)}`;
}

/**
 * Verify a signed mobile state and return its (validated) return URL, or null if
 * the state isn't a well-formed, correctly-signed mobile state.
 */
export function readMobileState(
  state: unknown
): { returnUrl: string; useCodeExchange: boolean } | null {
  if (!isMobileState(state)) return null;
  const body = (state as string).slice(MOBILE_STATE_PREFIX.length);
  const dot = body.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = body.slice(0, dot);
  const mac = body.slice(dot + 1);
  const expected = signPayload(payload);
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      r?: unknown;
      v?: unknown;
    };
    const returnUrl = safeReturnUrl(parsed.r);
    return returnUrl ? { returnUrl, useCodeExchange: parsed.v === 2 } : null;
  } catch {
    return null;
  }
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

/**
 * Mobile-only return URL. Stashed in a short-lived cookie at the start of the
 * flow and read on the callback so we can hand the browser back to the app deep
 * link. Only the app's own schemes are accepted (prevents an open redirect).
 */
export function safeReturnUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);

    // Release builds must return only to this app's dedicated OAuth route.
    if (parsed.protocol === 'btlee:') {
      const isOAuthRoute =
        (parsed.hostname === 'oauth' && (parsed.pathname === '' || parsed.pathname === '/')) ||
        (parsed.hostname === '' && parsed.pathname === '/oauth');
      return isOAuthRoute ? url : null;
    }

    // Expo Go uses exp(s)://<local-dev-host>/--/oauth. Limit it to loopback or
    // private LAN hosts so Expo Go can test against the deployed API without
    // turning the endpoint into an open redirect to an arbitrary Expo project.
    const host = parsed.hostname.toLowerCase();
    const octets = host.split('.').map(Number);
    const isPrivateIpv4 =
      octets.length === 4 &&
      octets.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) &&
      (octets[0] === 10 ||
        octets[0] === 127 ||
        (octets[0] === 192 && octets[1] === 168) ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31));
    const isLocalDevHost = host === 'localhost' || host === '[::1]' || isPrivateIpv4;
    if (
      (parsed.protocol === 'exp:' || parsed.protocol === 'exps:') &&
      isLocalDevHost &&
      parsed.pathname === '/--/oauth'
    ) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export function setReturnCookie(res: Response, url: string): void {
  res.cookie(OAUTH_RETURN_COOKIE, url, { ...cookieBase, maxAge: 10 * 60 * 1000 });
}

export function clearReturnCookie(res: Response): void {
  res.clearCookie(OAUTH_RETURN_COOKIE, cookieBase);
}

/** Constant-time compare to avoid leaking timing info on the state check. */
export function isValidState(fromCookie: unknown, fromQuery: unknown): boolean {
  if (typeof fromCookie !== 'string' || typeof fromQuery !== 'string') return false;
  if (fromCookie.length === 0 || fromCookie.length !== fromQuery.length) return false;
  return crypto.timingSafeEqual(Buffer.from(fromCookie), Buffer.from(fromQuery));
}
