/**
 * Car Mongoose Model
 * The second listing domain on the platform. Composes the domain-agnostic
 * listing spine (`shared/models/baseListing.ts`) and adds only car-specific
 * classification, specs, location, and its own lifecycle `status` enum —
 * exactly the pattern documented in ARCHITECTURE.md → "Adding a domain".
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import {
  CAR_LISTING_TYPES,
  CAR_CONDITIONS,
  CAR_TRANSMISSIONS,
  CAR_FUEL_TYPES,
  CAR_BODY_TYPES,
  CAR_STATUS,
  MIN_CAR_YEAR,
} from '../../config/constants.js';
import { baseListingFields } from '../../shared/models/baseListing.js';

// Optional GeoJSON point — same pattern as the property model: kept as its own
// sub-schema with `default: undefined` so a car without coordinates has NO
// `location` field at all (an empty point would be index-invalid).
const locationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

// Newest manufacturing year we accept (next model year — cars ship early).
const MAX_CAR_YEAR = new Date().getFullYear() + 1;

const carSchema = new Schema(
  {
    // Domain-agnostic listing spine (seq, owner, price, images, contact,
    // duration/expiry, featured flag, counters, rating aggregates). Shared with
    // the property domain — see shared/models/baseListing.ts.
    ...baseListingFields,

    // ── Car-specific below ──

    // Core classification
    listingType: { type: String, enum: CAR_LISTING_TYPES, required: true, index: true },
    condition: { type: String, enum: CAR_CONDITIONS, required: true, index: true },

    // Identity — free text (not enums) so no valid make/model is ever rejected.
    make: { type: String, required: true, trim: true, maxlength: 40, index: true },
    model: { type: String, required: true, trim: true, maxlength: 60 },

    // Specs
    year: { type: Number, required: true, min: MIN_CAR_YEAR, max: MAX_CAR_YEAR, index: true },
    mileage: { type: Number, default: null, min: 0 }, // km — null for brand-new
    transmission: { type: String, enum: CAR_TRANSMISSIONS, required: true },
    fuelType: { type: String, enum: CAR_FUEL_TYPES, required: true, index: true },
    bodyType: { type: String, enum: CAR_BODY_TYPES, required: true, index: true },
    color: { type: String, default: null, trim: true, maxlength: 30 },

    // Location
    governorate: { type: String, required: true, index: true, trim: true },
    area_name: { type: String, required: true, trim: true }, // المنطقة
    // Optional — absent entirely when the owner skips pinning a map location.
    location: { type: locationSchema, default: undefined },

    // Moderation state — its enum is car-specific, so it stays here (the base
    // is kept enum-free).
    status: {
      type: String,
      enum: CAR_STATUS,
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
carSchema.index({ location: '2dsphere' });

// Full-text search on make + model + description
carSchema.index(
  { make: 'text', model: 'text', description: 'text' },
  { weights: { make: 5, model: 4, description: 1 } }
);

// Compound index for the most common list query
carSchema.index({ status: 1, listingType: 1, bodyType: 1, createdAt: -1 });

// Supports the rating-first ordering used by the home sections (higher-rated
// approved cars surface first, newest as the tie-breaker).
carSchema.index({ status: 1, ratingAvg: -1, createdAt: -1 });

export type CarDoc = InferSchemaType<typeof carSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export const Car: Model<CarDoc> = model<CarDoc>('Car', carSchema);
