/**
 * Admin Auth Controller
 * Mirrors the user auth controller but uses the admin cookie set so a user
 * and an admin session can coexist in the same browser.
 */
import type { Request, Response } from 'express';
import * as service from './adminAuth.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';
import { setAuthCookies, clearAuthCookies, ADMIN_COOKIES } from '../../shared/utils/cookies.js';

function readRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[ADMIN_COOKIES.refresh];
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, admin } = await service.loginAdmin(
    req.body.email,
    req.body.password
  );
  setAuthCookies(res, { accessToken, refreshToken }, ADMIN_COOKIES);
  res.json(ok({ admin }));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = readRefreshCookie(req);
  if (!refreshToken) throw new UnauthorizedError('Refresh token required');
  const tokens = await service.refreshAdminTokens(refreshToken);
  setAuthCookies(res, tokens, ADMIN_COOKIES);
  res.json(ok({ message: 'Token refreshed' }));
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = readRefreshCookie(req);
  if (refreshToken) {
    await service.logoutAdmin(refreshToken).catch(() => {});
  }
  clearAuthCookies(res, ADMIN_COOKIES);
  res.json(ok({ message: 'Logged out' }));
}
