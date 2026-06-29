/**
 * Auth Controller
 * Thin layer between HTTP and service. No business logic here.
 *
 * Tokens are delivered as httpOnly cookies (never in the JSON body), so the
 * browser stores them out of reach of JavaScript. The response body carries
 * only the public user object.
 */
import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';
import { setAuthCookies, clearAuthCookies, USER_COOKIES } from '../../shared/utils/cookies.js';

function readRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[USER_COOKIES.refresh];
}

export async function register(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.registerUser(req.body);
  setAuthCookies(res, { accessToken, refreshToken }, USER_COOKIES);
  res.status(201).json(ok({ user }));
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body);
  setAuthCookies(res, { accessToken, refreshToken }, USER_COOKIES);
  res.json(ok({ user }));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = readRefreshCookie(req);
  if (!refreshToken) throw new UnauthorizedError('Refresh token required');
  const tokens = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens, USER_COOKIES);
  res.json(ok({ message: 'Token refreshed' }));
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = readRefreshCookie(req);
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
