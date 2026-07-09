/**
 * Cloudinary Controller
 * Accepts multipart uploads via multer, sends to Cloudinary, returns URLs.
 */
import type { Request, Response } from 'express';
import * as service from './cloudinary.service.js';
import { ok } from '../../shared/utils/apiResponse.js';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '../../shared/errors/AppError.js';

/**
 * Returns a short-lived Cloudinary signature so the browser can upload images
 * directly (the heavy bytes never touch our server). Auth-gated; the signature
 * is scoped to the caller's own folder.
 */
export async function uploadSignature(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const signature = service.createUploadSignature(req.user.userId);
  res.json(ok(signature));
}

export async function uploadImages(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    throw new BadRequestError('No images provided');
  }
  // Upload into the authenticated user's folder so deletes can be authorized.
  const uploaded = await service.uploadMultiple(files, req.user.userId);
  res.status(201).json(ok(uploaded));
}

export async function deleteImage(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { publicId } = req.body as { publicId: string };

  // Authorization: a user may only delete images inside their own folder.
  // Without this check any authenticated user could delete any listing's
  // images just by knowing the publicId (which is exposed in public API data).
  if (!service.isOwnedBy(publicId, req.user.userId)) {
    throw new ForbiddenError('You can only delete your own images');
  }

  await service.deleteImage(publicId);
  res.json(ok({ message: 'Deleted' }));
}
