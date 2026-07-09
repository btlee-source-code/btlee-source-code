/**
 * Notification Model
 * Stored per-user. Triggered by listing approval/rejection, saved-search matches, etc.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import { NOTIFICATION_TYPES } from '../../config/constants.js';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export type NotificationDoc = InferSchemaType<typeof notificationSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Notification: Model<NotificationDoc> = model<NotificationDoc>(
  'Notification',
  notificationSchema
);
