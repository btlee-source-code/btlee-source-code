/**
 * @btlee/shared — cross-platform source of truth (no UI).
 * Shared by apps/web (Next.js), apps/mobile (Expo), and apps/server (Express).
 *
 * Populated during the backend-prep phase with:
 *   - constants (LISTING_KINDS, property enums, …)
 *   - zod schemas (auth, property, wishlist, …)
 *   - inferred TypeScript types + API envelope shapes
 */
export * from './constants/index.js';
export * from './schemas/index.js';
export * from './types/index.js';
