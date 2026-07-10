/**
 * Cross-domain constants — the spine of domain-readiness.
 *
 * `LISTING_KINDS` — every kind of listing the platform can hold. Today only
 * `'property'`; a future domain (e.g. `'car'`) is added here + gets its own
 * enum file (`car.ts`) next to `property.ts`.
 *
 * `TARGET_TYPES` — what the shared systems (wishlist / ratings / reports) can
 * point at. Mirrors `LISTING_KINDS` today, but kept separate on purpose: a
 * shared system might later target something that is NOT a listing (e.g. a user
 * profile) without having to widen the set of listing kinds.
 */
export const LISTING_KINDS = ['property'] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

export const TARGET_TYPES = ['property'] as const;
export type TargetType = (typeof TARGET_TYPES)[number];
