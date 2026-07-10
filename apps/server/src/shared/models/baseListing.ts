/**
 * Base listing schema fragment — the domain-agnostic spine every listing shares,
 * regardless of what is being listed (property today; a car/… tomorrow).
 *
 * It holds ownership, content, contact, lifecycle TIMING, and metrics — and is
 * kept deliberately ENUM-FREE so it never couples to one domain's vocabulary.
 * Domain-specific concerns (classification, specs, moderation `status` with its
 * own enum, location) live on each domain's own schema.
 *
 * A new domain composes it by spreading the fields, then adding its own:
 *   const carSchema = new Schema(
 *     { ...baseListingFields, make, model, year, mileage, status },
 *     { timestamps: true },
 *   );
 *
 * See apps/server/src/ARCHITECTURE.md → "Adding a domain".
 */
import { Schema } from 'mongoose';

/** Image sub-doc shared by any listing's gallery (images[0] is the cover). */
export const imageSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Spread into a domain schema's definition. Mongoose reads these exactly as if
 * they were declared inline, so `InferSchemaType` and the stored document shape
 * are unchanged — this is a pure extraction, not a data change.
 */
export const baseListingFields = {
  // Human-friendly sequential listing number (1, 2, 3, …) shown to users
  // instead of the opaque ObjectId. Assigned on creation from an atomic
  // counter; see shared/models/counter.model.ts. Sparse so legacy docs
  // without it don't collide on the unique index before backfill runs.
  seq: { type: Number, unique: true, sparse: true, index: true },

  // Owner
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Price — optional (owner may hide it; UI shows "price on request")
  price: { type: Number, default: null, min: 1 },

  // Content
  description: { type: String, required: true, maxlength: 500, trim: true },
  images: { type: [imageSchema], required: true, validate: (v: unknown[]) => v.length >= 1 },

  // Contact
  whatsappNumber: { type: String, required: true, trim: true },

  // Listing duration (days the owner requested) + expiry timestamp
  durationDays: { type: Number, required: true, min: 30, max: 365 },
  expiresAt: { type: Date, required: true, index: true },

  // Admin flags
  isFeatured: { type: Boolean, default: false, index: true },

  // Counters
  viewCount: { type: Number, default: 0 },

  // Ratings — denormalized aggregates kept in sync by the ratings service so
  // listing queries can sort/read them cheaply without joining the Rating
  // collection. Source of truth is the Rating collection.
  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
};
