/**
 * User Mongoose Model
 * Represents a regular user (not admin — admins have their own model).
 * Used by auth, profile, wishlist, properties (as owner), etc.
 */
import { Schema, model, type InferSchemaType, type Model } from 'mongoose';
import { USER_GOALS } from '../../config/constants.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    // Identifiers — a user registers with EITHER email or phone (Facebook-style).
    // The register service sets exactly one; uniqueness for each is enforced via
    // the partial indexes below (so many phone-only or email-only users coexist).
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // Password is required only for local (email/phone) accounts. OAuth accounts
    // (Google) have no password — they authenticate via the provider.
    password: {
      type: String,
      select: false,
      required: function (this: { authProvider?: string }) {
        return (this.authProvider ?? 'local') === 'local';
      },
    },
    avatar: { type: String, default: null },

    // How the account authenticates. 'local' = email/phone + password.
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // Provider account ID (the 'sub' returned by the provider). Stored so a
    // returning user is matched by stable id, not just by email. select:false —
    // never leak it in normal reads.
    googleId: { type: String, default: null, select: false },
    // True once any provider (or future email-verification flow) has confirmed
    // the email belongs to the user. Drives safe account-linking by email.
    emailVerified: { type: Boolean, default: false },

    // Onboarding goal — set after popup right after registration
    goal: { type: String, enum: USER_GOALS, default: null },
    hasCompletedOnboarding: { type: Boolean, default: false },

    // Account state
    isBlocked: { type: Boolean, default: false },

    // Wishlist as array of property references (denormalized for fast reads)
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Property', default: [] }],

    // Refresh token whitelist (allows logout/invalidation)
    refreshTokens: { type: [String], default: [], select: false },

    // Password reset
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

// Unique only among accounts that actually have the field — an email-only user
// (no phone) won't collide with another on a missing phone, and vice-versa.
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
// Provider id is unique only among accounts that actually carry it.
userSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };
export const User: Model<UserDoc> = model<UserDoc>('User', userSchema);
