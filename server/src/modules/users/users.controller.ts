/**
 * Users Controller
 */
import type { Request, Response } from 'express';
import * as service from './users.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import { param } from '../../shared/utils/getParam.js';
import { UnauthorizedError } from '../../shared/errors/AppError.js';
import { setAuthCookies, USER_COOKIES } from '../../shared/utils/cookies.js';

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const profile = await service.getProfile(req.user.userId);
  res.json(ok(profile));
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const profile = await service.updateProfile(req.user.userId, req.body);
  res.json(ok(profile));
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  // Returns a fresh token pair: old sessions are revoked, this device stays in.
  const tokens = await service.changePassword(
    req.user.userId,
    req.body.currentPassword,
    req.body.newPassword
  );
  setAuthCookies(res, tokens, USER_COOKIES);
  res.json(ok({ message: 'Password changed' }));
}

export async function completeOnboarding(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const profile = await service.completeOnboarding(req.user.userId, req.body.goal);
  res.json(ok(profile));
}

export async function getPublicOwner(req: Request, res: Response): Promise<void> {
  const owner = await service.getPublicOwnerProfile(param(req, 'userId'));
  res.json(ok(owner));
}
