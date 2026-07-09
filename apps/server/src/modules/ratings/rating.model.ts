/**
 * Rating Mongoose Model
 * One document per (user, property) pair — a user has a single, updatable
 * rating for any given property. The denormalized averages on the Property
 * document are recomputed from this collection on every change.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// One rating per user per property — makes the upsert idempotent and blocks
// ballot-stuffing by repeated POSTs.
ratingSchema.index({ user: 1, property: 1 }, { unique: true });

export type RatingDoc = InferSchemaType<typeof ratingSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export const Rating: Model<RatingDoc> = model<RatingDoc>('Rating', ratingSchema);
