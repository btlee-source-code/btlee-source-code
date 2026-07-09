/**
 * Shared domain constants.
 * `LISTING_KINDS` anchors the domain-readiness design: today only 'property',
 * but any future domain slots in here + its own enum file.
 */
export const LISTING_KINDS = ['property'] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];
