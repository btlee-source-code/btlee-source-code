/**
 * JWT Token Utilities
 * Signs and verifies access + refresh tokens used for authentication.
 */
import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { AuthPayload } from '../middlewares/authMiddleware.js';

/**
 * One-way hash for storing refresh tokens at rest. We never store the raw
 * refresh token in the DB — only its SHA-256 hash — so a database leak does
 * not hand out usable tokens. (Same approach used for password-reset tokens.)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Cap on stored refresh-token hashes per account. Bounds the whitelist so it
 * can't grow without limit (each login/refresh adds one) — old sessions beyond
 * this many are dropped oldest-first. ~10 concurrent devices is generous.
 */
export const MAX_SESSIONS_PER_ACCOUNT = 10;

/** Mongo update that appends a refresh-token hash and caps the whitelist size. */
export function pushRefreshTokenUpdate(hash: string) {
  return {
    $push: { refreshTokens: { $each: [hash], $slice: -MAX_SESSIONS_PER_ACCOUNT } },
  };
}

/**
 * Aggregation-pipeline update that atomically rotates a refresh token: in a
 * single write it drops the old hash, appends the new one, and caps the array.
 * Replaces the pull-then-push pair so concurrent refreshes can't race.
 */
export function rotateRefreshTokenPipeline(oldHash: string, newHash: string) {
  return [
    {
      $set: {
        refreshTokens: {
          $slice: [
            {
              $concatArrays: [
                {
                  $filter: {
                    input: { $ifNull: ['$refreshTokens', []] },
                    cond: { $ne: ['$$this', oldHash] },
                  },
                },
                [newHash],
              ],
            },
            -MAX_SESSIONS_PER_ACCOUNT,
          ],
        },
      },
    },
  ];
}

// Pin the HMAC algorithm on both sign and verify. jsonwebtoken already rejects
// `alg:none`, but explicitly pinning HS256 blocks any algorithm-confusion trickery.
const ALGO = 'HS256' as const;

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    algorithm: ALGO,
  } as SignOptions);
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: ALGO,
  } as SignOptions);
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: [ALGO] }) as AuthPayload;
}

export function issueTokens(payload: AuthPayload) {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}
