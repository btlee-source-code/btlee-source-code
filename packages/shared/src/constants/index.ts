/**
 * Shared domain constants barrel.
 * - `shared.ts`   → cross-domain spine (LISTING_KINDS, TARGET_TYPES).
 * - `property.ts` → the property domain's enum values (today's only domain).
 * A future domain adds its own file here and registers itself in `shared.ts`.
 */
export * from './shared';
export * from './property';
