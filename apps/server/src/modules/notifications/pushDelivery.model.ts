import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

export const PUSH_DELIVERY_STATUSES = [
  'queued',
  'awaiting_receipt',
  'delivered',
  'failed',
  'cancelled',
  'unknown',
] as const;

const pushDeliverySchema = new Schema(
  {
    notification: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Tokens are operational secrets and must never appear in ordinary queries.
    token: { type: String, required: true, select: false },
    status: {
      type: String,
      enum: PUSH_DELIVERY_STATUSES,
      default: 'queued',
      required: true,
      index: true,
    },
    ticketId: { type: String, default: null, index: true },
    sendAttempts: { type: Number, default: 0 },
    receiptAttempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    lastErrorCode: { type: String, default: null },
    lastErrorMessage: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pushDeliverySchema.index({ notification: 1, token: 1 }, { unique: true });
pushDeliverySchema.index({ status: 1, nextAttemptAt: 1 });
pushDeliverySchema.index({ completedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export type PushDeliveryDoc = InferSchemaType<typeof pushDeliverySchema> & {
  _id: Schema.Types.ObjectId;
};

export const PushDelivery: Model<PushDeliveryDoc> = model<PushDeliveryDoc>(
  'PushDelivery',
  pushDeliverySchema
);
