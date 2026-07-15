/**
 * Per-route rate limiters for abuse-prone endpoints.
 *
 * The global limiter (app.ts, 300/15min/IP) is a coarse backstop. These tighter
 * limiters guard the endpoints an authenticated user could flood — creating
 * listings, uploading images (memory-heavy multipart), and rating/reporting —
 * so a single account can't spam pending content or exhaust instance memory.
 *
 * Keyed by IP (same as the auth limiter). On a single instance this is effective;
 * if the API is ever scaled horizontally, move these to a shared store (Redis /
 * rate-limit-mongo) so counters are global rather than per-instance.
 */
import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000; // 15 minutes

const common = {
  windowMs,
  standardHeaders: true,
  legacyHeaders: false,
} as const;

const tooMany = (message: string) => ({ status: 'error' as const, message });

/** Creating listings (properties/cars). A real user posts a handful, not dozens. */
export const createListingLimiter = rateLimit({
  ...common,
  max: 20,
  message: tooMany('Too many listings created. Please try again later.'),
});

/**
 * Image uploads — both the signed direct-to-Cloudinary path and the memory-heavy
 * multipart route. Generous enough for a multi-image listing (a signature per
 * image), tight enough to stop a flood that would inflate storage / RAM.
 */
export const uploadLimiter = rateLimit({
  ...common,
  max: 80,
  message: tooMany('Too many uploads. Please try again later.'),
});

/** Ratings, reports, and other cheap engagement writes. */
export const interactionLimiter = rateLimit({
  ...common,
  max: 60,
  message: tooMany('Too many requests. Please slow down and try again later.'),
});
