/**
 * Report Model
 * Stores user reports against listings. Admin reviews them in the dashboard.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import { REPORT_REASONS, TARGET_TYPES } from '../../config/constants.js';

const reportSchema = new Schema(
  {
    // Domain-agnostic target (domain-readiness), dual-written alongside
    // `property` so any future domain reuses this same reports collection.
    targetType: { type: String, enum: TARGET_TYPES, default: 'property' },
    targetId: { type: Schema.Types.ObjectId },

    // Legacy property reference — kept (dual-written) so existing data, the
    // admin populate, and the web read path are untouched. No longer `required`:
    // a future non-property report omits it. See ARCHITECTURE.md.
    property: { type: Schema.Types.ObjectId, ref: 'Property', index: true },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, maxlength: 500, default: null },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'dismissed'],
      default: 'open',
      index: true,
    },
  },
  { timestamps: true }
);

export type ReportDoc = InferSchemaType<typeof reportSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Report: Model<ReportDoc> = model<ReportDoc>('Report', reportSchema);
