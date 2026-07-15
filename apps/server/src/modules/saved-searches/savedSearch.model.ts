/**
 * Saved Search Model
 * Stores a user's saved filter criteria. When a new approved property matches,
 * an in-app + email notification is sent.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  TARGET_TYPES,
  CAR_CONDITIONS,
  CAR_BODY_TYPES,
  CAR_FUEL_TYPES,
  CAR_TRANSMISSIONS,
} from '../../config/constants.js';

const savedSearchSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },

    // Which domain this saved search matches (domain-readiness). No `targetId`
    // here — a saved search matches MANY future items, not one target. A future
    // domain stores its own criteria shape under the same `targetType`.
    targetType: { type: String, enum: TARGET_TYPES, default: 'property' },

    // Filter criteria (subset of public list query). Shared by both domains:
    // search / listingType / governorate / minPrice / maxPrice.
    search: { type: String, default: null },
    type: { type: String, enum: PROPERTY_TYPES, default: null },
    listingType: { type: String, enum: LISTING_TYPES, default: null },
    category: { type: String, enum: PROPERTY_CATEGORIES, default: null },
    governorate: { type: String, default: null },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    minBedrooms: { type: Number, default: null },
    minArea: { type: Number, default: null },

    // Car-only criteria (null for property searches).
    condition: { type: String, enum: CAR_CONDITIONS, default: null },
    bodyType: { type: String, enum: CAR_BODY_TYPES, default: null },
    fuelType: { type: String, enum: CAR_FUEL_TYPES, default: null },
    transmission: { type: String, enum: CAR_TRANSMISSIONS, default: null },
    minYear: { type: Number, default: null },
    maxYear: { type: Number, default: null },
    maxMileage: { type: Number, default: null },

    lastNotifiedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export type SavedSearchDoc = InferSchemaType<typeof savedSearchSchema> & {
  _id: Schema.Types.ObjectId;
};
export const SavedSearch: Model<SavedSearchDoc> = model<SavedSearchDoc>(
  'SavedSearch',
  savedSearchSchema
);
