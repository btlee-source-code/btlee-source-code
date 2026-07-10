/**
 * Rating Mongoose Model
 * One document per (user, property) pair — a user has a single, updatable
 * rating for any given property. The denormalized averages on the Property
 * document are recomputed from this collection on every change.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import { TARGET_TYPES } from '../../config/constants.js';

const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Domain-agnostic target (domain-readiness). Written alongside `property`
    // for property ratings so any future domain reuses this same collection.
    targetType: { type: String, enum: TARGET_TYPES, default: 'property' },
    targetId: { type: Schema.Types.ObjectId },

    // Legacy property reference — kept (dual-written) so existing data, indexes,
    // and the web read path are untouched. No longer `required`: a future
    // non-property rating omits it. See ARCHITECTURE.md → "Adding a domain".
    property: { type: Schema.Types.ObjectId, ref: 'Property', index: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// One rating per user per property — makes the upsert idempotent and blocks
// ballot-stuffing by repeated POSTs. (Property flow always sets `property`.)
ratingSchema.index({ user: 1, property: 1 }, { unique: true });

// Domain-agnostic uniqueness for any future target. Partial so it indexes ONLY
// rows that carry a targetId — i.e. zero existing rows today, so it creates
// cleanly with no backfill. When a non-property domain ships, drop the legacy
// `{ user, property }` index (see the playbook) and this becomes the sole guard.
ratingSchema.index(
  { user: 1, targetType: 1, targetId: 1 },
  { unique: true, partialFilterExpression: { targetId: { $exists: true } } }
);

export type RatingDoc = InferSchemaType<typeof ratingSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export const Rating: Model<RatingDoc> = model<RatingDoc>('Rating', ratingSchema);
