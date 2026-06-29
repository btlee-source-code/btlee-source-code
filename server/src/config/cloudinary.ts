/**
 * Cloudinary SDK Configuration
 * Used for uploading and managing property images.
 * Images are uploaded from the server (not the client) for security.
 */
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
