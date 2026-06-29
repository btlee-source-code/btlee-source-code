/**
 * Auth Service
 * Business logic for registration, login, token refresh, logout, password reset.
 * Returns plain data — no Express coupling here.
 */
import crypto from 'node:crypto';
import { User } from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import { issueTokens, verifyRefreshToken, hashToken } from '../../shared/utils/jwt.js';
import { sendEmail } from '../../shared/utils/email.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '../../shared/errors/AppError.js';
import { env } from '../../config/env.js';
import { isEmailIdentifier, normalizePhone } from './auth.validators.js';
import type { RegisterInput, LoginInput } from './auth.validators.js';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends AuthTokens {
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

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  // Registration requires BOTH an email and a phone number.
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone.trim());

  // Reject if either identifier is already taken — report which one collided.
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    const emailTaken = existing.email != null && existing.email === email;
    throw new ConflictError(
      emailTaken
        ? 'An account with this email already exists'
        : 'An account with this phone number already exists'
    );
  }

  const hashed = await hashPassword(input.password);
  const user = await User.create({
    name: input.name.trim(),
    email,
    phone,
    password: hashed,
  });

  const tokens = issueTokens({ userId: String(user._id), role: 'user' });

  // Whitelist the refresh token (stored hashed) so it can be invalidated on logout
  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokens: hashToken(tokens.refreshToken) } }
  );

  return { ...tokens, user: toPublicUser(user) };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const id = input.identifier.trim();
  const query = isEmailIdentifier(id)
    ? { email: id.toLowerCase() }
    : { phone: normalizePhone(id) };
  const user = await User.findOne(query).select('+password');
  if (!user) throw new UnauthorizedError('Invalid credentials');

  if (user.isBlocked) {
    throw new ForbiddenError('This account has been blocked. Please contact support.');
  }

  // OAuth-only accounts have no password — guide the user to the right button
  // instead of returning a misleading "invalid credentials".
  if (!user.password) {
    throw new UnauthorizedError(
      'This account uses social sign-in. Please continue with Google.'
    );
  }

  const ok = await comparePassword(input.password, user.password);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  const tokens = issueTokens({ userId: String(user._id), role: 'user' });

  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokens: hashToken(tokens.refreshToken) } }
  );

  return { ...tokens, user: toPublicUser(user) };
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Confirm token is still whitelisted (wasn't logged out). Stored hashed.
  const hashed = hashToken(refreshToken);
  const user = await User.findById(payload.userId).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(hashed)) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  const newTokens = issueTokens({ userId: String(user._id), role: 'user' });

  // Rotate the refresh token (remove old hash, add new hash)
  await User.updateOne({ _id: user._id }, { $pull: { refreshTokens: hashed } });
  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokens: hashToken(newTokens.refreshToken) } }
  );

  return newTokens;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const hashed = hashToken(refreshToken);
  // Revoke this specific session wherever it lives — no need to trust a userId.
  await User.updateOne({ refreshTokens: hashed }, { $pull: { refreshTokens: hashed } });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({ email: email.toLowerCase() });
  // Don't reveal whether the email exists — return silently
  if (!user || !user.email) return;

  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  await User.updateOne(
    { _id: user._id },
    {
      resetPasswordToken: hashed,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    }
  );

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
  // Fire-and-forget — don't block the response on SMTP. sendEmail logs failures.
  void sendEmail({
    to: user.email,
    subject: 'إعادة تعيين كلمة المرور — بيت لي',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في بيت لي.</p>
        <p>اضغط على الرابط التالي لتعيين كلمة مرور جديدة (صالح لمدة ساعة):</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#1A3C34;color:#fff;text-decoration:none;border-radius:6px;">إعادة تعيين كلمة المرور</a>
        <p style="margin-top:20px;color:#666;">لو لم تطلب هذا الإيميل، يمكنك تجاهله بأمان.</p>
      </div>
    `,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires +refreshTokens');

  if (!user) throw new NotFoundError('Invalid or expired reset token');

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  // Security: invalidate every existing session — a password reset must log
  // out any attacker who may have hijacked the account.
  user.refreshTokens = [];
  await user.save();
}
