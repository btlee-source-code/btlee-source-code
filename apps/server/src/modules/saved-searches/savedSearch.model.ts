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
} from '../../config/constants.js';

const savedSearchSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },

    // Filter criteria (subset of public list query)
    search: { type: String, default: null },
    type: { type: String, enum: PROPERTY_TYPES, default: null },
    listingType: { type: String, enum: LISTING_TYPES, default: null },
    category: { type: String, enum: PROPERTY_CATEGORIES, default: null },
    governorate: { type: String, default: null },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    minBedrooms: { type: Number, default: null },
    minArea: { type: Number, default: null },

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
