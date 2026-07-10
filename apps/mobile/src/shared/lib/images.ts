/**
 * Cloudinary helpers for the blur-up loading effect: a tiny, heavily-blurred
 * variant of the image loads first (a few KB) and the real image cross-fades
 * over it — the Airbnb/Instagram feel. Non-Cloudinary URLs get no placeholder.
 */
const UPLOAD_SEGMENT = '/upload/';

export function blurPlaceholder(url?: string | null): string | undefined {
  if (!url || !url.includes('res.cloudinary.com')) return undefined;
  const i = url.indexOf(UPLOAD_SEGMENT);
  if (i === -1) return undefined;
  const at = i + UPLOAD_SEGMENT.length;
  return `${url.slice(0, at)}w_60,q_20,e_blur:150/${url.slice(at)}`;
}
