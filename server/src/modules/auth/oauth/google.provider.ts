/**
 * Google OAuth provider.
 *
 * Implements the OAuth 2.0 Authorization Code flow using Google's official
 * library. We don't use Passport — this matches the codebase's lightweight,
 * explicit auth style (custom JWT + cookies).
 *
 * Flow:
 *   1. getAuthUrl()  → URL we redirect the browser to (Google consent screen)
 *   2. Google redirects back to GOOGLE_CALLBACK_URL with ?code=...&state=...
 *   3. getProfile(code) → exchange the code for tokens and verify the id_token,
 *      returning a normalized profile.
 */
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../../config/env.js';
import { UnauthorizedError, AppError } from '../../../shared/errors/AppError.js';
import type { OAuthProfile } from './oauth.types.js';

/** Scopes: the user's basic profile + verified email. */
const SCOPES = ['openid', 'email', 'profile'];

/**
 * Build the OAuth client lazily. Throws a clear 503 if Google isn't configured
 * so a missing .env surfaces as an actionable error rather than a crash.
 */
function getClient(): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw new AppError('Google sign-in is not configured on the server', 503);
  }
  return new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_CALLBACK_URL,
  });
}

/** Whether Google sign-in is configured (used to show/hide the button). */
export function isConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL);
}

/** URL of Google's consent screen. `state` is echoed back for CSRF protection. */
export function getAuthUrl(state: string): string {
  return getClient().generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
    state,
    prompt: 'select_account',
  });
}

/** Exchange the authorization code for a verified Google profile. */
export async function getProfile(code: string): Promise<OAuthProfile> {
  const client = getClient();

  let idToken: string | undefined;
  try {
    const { tokens } = await client.getToken(code);
    idToken = tokens.id_token ?? undefined;
  } catch {
    throw new UnauthorizedError('Failed to exchange Google authorization code');
  }
  if (!idToken) throw new UnauthorizedError('Google did not return an identity token');

  // Verify the id_token signature + audience against our client id.
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new UnauthorizedError('Google profile is missing required fields');
  }

  return {
    provider: 'google',
    providerId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: payload.name?.trim() || payload.email.split('@')[0],
    avatar: payload.picture ?? null,
  };
}
