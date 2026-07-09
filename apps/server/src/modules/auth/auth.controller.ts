/**
 * Auth Controller
 * Thin layer between HTTP and service. No business logic here.
 *
 * Web: tokens are delivered as httpOnly cookies (never in the JSON body), so the
 * browser stores them out of reach of JavaScript; the body carries only the user.
 *
 * Mobile: native apps can't use httpOnly cookies. When a client sends
 * `X-Client: mobile`, the tokens are ALSO returned in the JSON body (and the
 * refresh/logout tokens are read from the body). Cookies are still set too, so
 * the web behaviour is completely unchanged — this is purely additive.
 */
import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';
import { setAuthCookies, clearAuthCookies, USER_COOKIES } from '../../shared/utils/cookies.js';

function readRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[USER_COOKIES.refresh];
}

/** Native clients ask for tokens in the body via `X-Client: mobile`. */
function wantsBodyTokens(req: Request): boolean {
  return req.get('x-client') === 'mobile';
}

/** Refresh token location differs by client: web = httpOnly cookie, mobile = body. */
function readRefreshToken(req: Request): string | undefined {
  const fromBody = (req.body as { refreshToken?: string } | undefined)?.refreshToken;
  return fromBody ?? readRefreshCookie(req);
}

export async function register(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.registerUser(req.body);
  setAuthCookies(res, { accessToken, refreshToken }, USER_COOKIES);
  res.status(201).json(ok(wantsBodyTokens(req) ? { user, accessToken, refreshToken } : { user }));
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body);
  setAuthCookies(res, { accessToken, refreshToken }, USER_COOKIES);
  res.json(ok(wantsBodyTokens(req) ? { user, accessToken, refreshToken } : { user }));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = readRefreshToken(req);
  if (!refreshToken) throw new UnauthorizedError('Refresh token required');
  const tokens = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens, USER_COOKIES);
  res.json(ok(wantsBodyTokens(req) ? { message: 'Token refreshed', ...tokens } : { message: 'Token refreshed' }));
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = readRefreshToken(req);
  if (refreshToken) {
    await authService.logoutUser(refreshToken).catch(() => {});
  }
  clearAuthCookies(res, USER_COOKIES);
  res.json(ok({ message: 'Logged out successfully' }));
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  await authService.requestPasswordReset(req.body.email);
  res.json(ok({ message: 'If an account exists, a reset link has been sent.' }));
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  await authService.resetPassword(req.body.token, req.body.password);
  // All sessions were revoked server-side; clear any cookies on this device too.
  clearAuthCookies(res, USER_COOKIES);
  res.json(ok({ message: 'Password reset successfully' }));
}
