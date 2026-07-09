/**
 * Admin Model
 * Kept separate from User to enforce a hard boundary — admin accounts cannot
 * be created via public registration.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    refreshTokens: { type: [String], default: [], select: false },
  },
  { timestamps: true }
);

export type AdminDoc = InferSchemaType<typeof adminSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Admin: Model<AdminDoc> = model<AdminDoc>('Admin', adminSchema);
