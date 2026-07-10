/**
 * Property Mongoose Model
 * The core entity of the platform — every listing the user posts.
 * Includes full-text search index, geospatial index, and lifecycle state.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  FINISHING_TYPES,
  PROPERTY_SERVICES,
  DEPOSIT_OPTIONS,
  PROPERTY_STATUS,
} from '../../config/constants.js';
import { baseListingFields } from '../../shared/models/baseListing.js';

// Optional GeoJSON point. Kept as its own sub-schema with `default: undefined`
// (below) so a listing without coordinates has NO `location` field at all —
// otherwise a leaf-level default would materialize an empty, index-invalid point.
const locationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const propertySchema = new Schema(
  {
    // Domain-agnostic listing spine (seq, owner, price, images, contact,
    // duration/expiry, featured flag, counters, rating aggregates). Shared by
    // any future listing domain — see shared/models/baseListing.ts.
    ...baseListingFields,

    // ── Property-specific below ──

    // Core classification
    type: { type: String, enum: PROPERTY_TYPES, required: true, index: true },
    listingType: { type: String, enum: LISTING_TYPES, required: true, index: true },
    category: { type: String, enum: PROPERTY_CATEGORIES, required: true, index: true },

    // Specs
    bedrooms: { type: Number, required: true, min: 0, max: 50 },
    bathrooms: { type: Number, required: true, min: 0, max: 50 },
    floor: { type: Number, default: null, min: -5, max: 200 }, // required only when type=apartment (enforced in service)
    area: { type: Number, default: null, min: 1 }, // m² — optional
    finishing: { type: String, enum: FINISHING_TYPES, required: true },

    // Available utilities (gas / water / electricity) — any subset.
    services: { type: [String], enum: PROPERTY_SERVICES, default: [] },
    // Amenities
    hasElevator: { type: Boolean, default: false }, // أسانسير
    hasGarage: { type: Boolean, default: false }, // جراج
    // Required deposit for rentals (التأمين المطلوب) — optional.
    deposit: { type: String, enum: DEPOSIT_OPTIONS, default: null },

    // Location
    governorate: { type: String, required: true, index: true, trim: true },
    area_name: { type: String, required: true, trim: true }, // المنطقة
    // Optional — absent entirely when the owner skips pinning a map location.
    location: { type: locationSchema, default: undefined },

    // Moderation state — its enum is property-specific, so it stays here (the
    // base is kept enum-free). A future domain declares its own `status`.
    status: {
      type: String,
      enum: PROPERTY_STATUS,
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
propertySchema.index({ location: '2dsphere' });

// Full-text search on description + area_name + governorate
propertySchema.index(
  { description: 'text', area_name: 'text', governorate: 'text' },
  { weights: { area_name: 5, governorate: 3, description: 1 } }
);

// Compound index for the most common list query
propertySchema.index({ status: 1, listingType: 1, type: 1, createdAt: -1 });

// Supports the rating-first ordering used by the home sections (higher-rated
// approved listings surface first, newest as the tie-breaker).
propertySchema.index({ status: 1, ratingAvg: -1, createdAt: -1 });

export type PropertyDoc = InferSchemaType<typeof propertySchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export const Property: Model<PropertyDoc> = model<PropertyDoc>('Property', propertySchema);
