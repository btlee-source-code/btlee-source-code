/**
 * Cloudinary Service
 * Uploads image buffers to Cloudinary and returns the public URLs + IDs.
 * The frontend sends multipart form-data; multer parses it and we stream to Cloudinary.
 *
 * Security: every user's uploads live under a per-user folder
 * (`btlee/properties/<userId>`). This lets us authorize deletes — a user may
 * only delete images that live inside their own folder.
 */
import streamifier from 'streamifier';
import { cloudinary } from '../../config/cloudinary.js';
import { env } from '../../config/env.js';
import type { CloudinaryImage } from '../../shared/types/index.js';

interface UploadResult {
  publicId: string;
  url: string;
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

/** Root folder for all property images. */
export const PROPERTY_IMAGES_ROOT = 'btlee/properties';

/** Per-user upload folder — used to scope ownership. */
export function userFolder(userId: string): string {
  return `${PROPERTY_IMAGES_ROOT}/${userId}`;
}

/**
 * Whether a Cloudinary publicId belongs to the given user, i.e. it lives
 * directly under that user's folder. Used to authorize image deletion.
 */
export function isOwnedBy(publicId: string, userId: string): boolean {
  if (typeof publicId !== 'string') return false;
  return publicId.startsWith(`${userFolder(userId)}/`);
}

export function uploadBuffer(buffer: Buffer, folder: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1600, height: 1200, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({ publicId: result.public_id, url: result.secure_url });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function uploadMultiple(
  files: { buffer: Buffer }[],
  userId: string
): Promise<CloudinaryImage[]> {
  const folder = userFolder(userId);
  return Promise.all(files.map((f) => uploadBuffer(f.buffer, folder)));
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Builds a short-lived signature that lets the browser upload images DIRECTLY
 * to Cloudinary (bypassing our server, so large multi-image uploads never hit
 * any request-size limit on the API host or its proxy).
 *
 * The signature pins the destination `folder` to the user's own folder — the
 * same scoping used to authorize deletes — so a client cannot upload outside
 * it. Only `folder` + `timestamp` are signed; the file itself is never part of
 * the signature, so one signature covers a whole batch of images.
 */
export function createUploadSignature(userId: string): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = userFolder(userId);
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    env.CLOUDINARY_API_SECRET
  );
  return {
    signature,
    timestamp,
    folder,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
  };
}
