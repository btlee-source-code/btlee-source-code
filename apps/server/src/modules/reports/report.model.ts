/**
 * Report Model
 * Stores user reports against listings. Admin reviews them in the dashboard.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import { REPORT_REASONS } from '../../config/constants.js';

const reportSchema = new Schema(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
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
