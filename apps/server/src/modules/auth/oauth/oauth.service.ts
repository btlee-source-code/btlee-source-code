/**
 * OAuth service — resolves a verified provider profile into a local user,
 * issuing our own JWT session (so the rest of the app is provider-agnostic).
 *
 * Account-linking policy (agreed): if an account already exists with the same
 * email AND the provider has verified that email, we LINK the provider to the
 * existing account instead of creating a duplicate. We refuse to link (or trust)
 * an unverified provider email.
 */
import crypto from 'node:crypto';
import { User, type UserDoc } from '../../users/user.model.js';
import { issueTokens, hashToken, pushRefreshTokenUpdate } from '../../../shared/utils/jwt.js';
import { ForbiddenError, UnauthorizedError } from '../../../shared/errors/AppError.js';
import type { OAuthProfile } from './oauth.types.js';
import { OAuthHandoff } from './oauth-handoff.model.js';

interface OAuthResult {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    goal: string | null;
    hasCompletedOnboarding: boolean;
  };
}

interface ResolvedOAuthUser {
  user: UserDoc;
  isNewUser: boolean;
}

const MOBILE_HANDOFF_TTL_MS = 2 * 60 * 1000;

function toPublicUser(user: {
  _id: unknown;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  goal?: string | null;
  hasCompletedOnboarding?: boolean;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    goal: user.goal ?? null,
    hasCompletedOnboarding: Boolean(user.hasCompletedOnboarding),
  };
}

/** Which user field stores this provider's stable account id. */
const ID_FIELD = {
  google: 'googleId',
} as const;

/**
 * Find a user by provider id, else link by verified email, else create one.
 * Returns the public user + a freshly issued (and whitelisted) token pair.
 */
async function resolveOAuthUser(profile: OAuthProfile): Promise<ResolvedOAuthUser> {
  const idField = ID_FIELD[profile.provider];
  const email = profile.email?.trim().toLowerCase() ?? null;
  let isNewUser = false;

  // 1) Returning user — matched by stable provider id.
  let user = await User.findOne({ [idField]: profile.providerId }).select(`+${idField}`);

  // 2) No provider match — try to link to an existing account by verified email.
  if (!user && email) {
    // Never trust an unverified provider email — it could let someone hijack an
    // account by signing up to the provider with a victim's address.
    if (!profile.emailVerified) {
      throw new UnauthorizedError(`Your ${profile.provider} email is not verified`);
    }

    const byEmail = await User.findOne({ email });
    if (byEmail) {
      byEmail.set(idField, profile.providerId);
      byEmail.emailVerified = true;
      if (!byEmail.avatar && profile.avatar) byEmail.avatar = profile.avatar;
      await byEmail.save();
      user = byEmail;
    }
  }

  // 3) Still nothing — create a brand-new account. No phone yet (OAuth gives us
  //    only an email).
  if (!user) {
    user = await User.create({
      name: profile.name,
      ...(email ? { email } : {}),
      avatar: profile.avatar,
      authProvider: profile.provider,
      [idField]: profile.providerId,
      emailVerified: Boolean(email),
    });
    isNewUser = true;
  }

  if (user.isBlocked) {
    throw new ForbiddenError('This account has been blocked. Please contact support.');
  }

  return { user, isNewUser };
}

async function issueUserSession(user: UserDoc, isNewUser: boolean): Promise<OAuthResult> {
  if (user.isBlocked) {
    throw new ForbiddenError('This account has been blocked. Please contact support.');
  }

  const tokens = issueTokens({ userId: String(user._id), role: 'user' });
  await User.updateOne({ _id: user._id }, pushRefreshTokenUpdate(hashToken(tokens.refreshToken)));

  return { ...tokens, isNewUser, user: toPublicUser(user) };
}

export async function loginWithOAuth(profile: OAuthProfile): Promise<OAuthResult> {
  const { user, isNewUser } = await resolveOAuthUser(profile);
  return issueUserSession(user, isNewUser);
}

/**
 * Creates an opaque, short-lived code for the native app. The code is safe to
 * put in a deep link because it contains no session data and can be used once.
 */
export async function createMobileHandoff(profile: OAuthProfile): Promise<string> {
  const { user, isNewUser } = await resolveOAuthUser(profile);
  const code = crypto.randomBytes(32).toString('base64url');

  await OAuthHandoff.create({
    codeHash: hashToken(code),
    userId: user._id,
    isNewUser,
    expiresAt: new Date(Date.now() + MOBILE_HANDOFF_TTL_MS),
  });

  return code;
}

/**
 * Atomically consumes a native OAuth handoff and issues the real session only
 * after the app exchanges it over HTTPS.
 */
export async function exchangeMobileHandoff(code: string): Promise<OAuthResult> {
  const handoff = await OAuthHandoff.findOneAndDelete({
    codeHash: hashToken(code),
    expiresAt: { $gt: new Date() },
  });
  if (!handoff) throw new UnauthorizedError('Invalid or expired Google sign-in code');

  const user = await User.findById(handoff.userId);
  if (!user) throw new UnauthorizedError('Google account is no longer available');

  return issueUserSession(user, handoff.isNewUser);
}
