/**
 * Cloudinary Routes — /api/uploads/*
 * Image uploads use multer in memory then stream to Cloudinary.
 */
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import * as controller from './cloudinary.controller.js';
import { protect } from '../../shared/middlewares/authMiddleware.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import { uploadLimiter } from '../../shared/middlewares/rateLimiters.js';
import { MAX_IMAGES_PER_PROPERTY } from '../../config/constants.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const deleteSchema = z.object({ publicId: z.string().min(1) });

export const uploadsRouter = Router();

// Direct-to-Cloudinary signature — the browser uploads images itself using this.
uploadsRouter.get('/signature', protect, uploadLimiter, asyncHandler(controller.uploadSignature));

uploadsRouter.post(
  '/images',
  protect,
  uploadLimiter,
  upload.array('images', MAX_IMAGES_PER_PROPERTY),
  asyncHandler(controller.uploadImages)
);

uploadsRouter.delete(
  '/images',
  protect,
  validate({ body: deleteSchema }),
  asyncHandler(controller.deleteImage)
);
