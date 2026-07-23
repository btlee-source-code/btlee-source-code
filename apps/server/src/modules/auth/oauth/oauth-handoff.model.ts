import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

/**
 * A short-lived, single-use bridge between the browser OAuth callback and the
 * native app. Only the hash of the opaque code is stored, and no access or
 * refresh token is ever placed in the deep-link URL.
 */
const oauthHandoffSchema = new Schema(
  {
    codeHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isNewUser: { type: Boolean, required: true, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false }
);

// MongoDB removes abandoned handoffs automatically. The exchange query also
// checks expiresAt, so an expired code is rejected even before the TTL sweep.
oauthHandoffSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OAuthHandoffDoc = InferSchemaType<typeof oauthHandoffSchema>;
export const OAuthHandoff: Model<OAuthHandoffDoc> = model<OAuthHandoffDoc>(
  'OAuthHandoff',
  oauthHandoffSchema
);
