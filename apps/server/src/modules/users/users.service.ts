/**
 * Users Service
 * Profile management, onboarding completion, account updates.
 */
import { User } from './user.model.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import { issueTokens, hashToken } from '../../shared/utils/jwt.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { USER_GOALS, type UserGoal } from '../../config/constants.js';

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  return {
    id: String(user._id),
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar: user.avatar,
    goal: user.goal,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    createdAt: (user as { createdAt?: Date }).createdAt,
  };
}

export async function updateProfile(
  userId: string,
  data: { name?: string; avatar?: string | null }
) {
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.avatar !== undefined) update.avatar = data.avatar;

  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) throw new NotFoundError('User not found');
  return getProfile(userId);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await User.findById(userId).select('+password +refreshTokens');
  if (!user) throw new NotFoundError('User not found');

  // Social-login accounts have no local password to verify or change here.
  if (!user.password) {
    throw new BadRequestError('This account uses social sign-in and has no password');
  }

  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) throw new BadRequestError('Current password is incorrect');

  user.password = await hashPassword(newPassword);

  // Revoke all existing sessions, then issue a fresh one for the current
  // device so the user stays logged in here but every other session is killed.
  const tokens = issueTokens({ userId: String(user._id), role: 'user' });
  user.refreshTokens = [hashToken(tokens.refreshToken)];
  await user.save();

  return tokens;
}

export async function completeOnboarding(userId: string, goal: UserGoal) {
  if (!USER_GOALS.includes(goal)) {
    throw new BadRequestError('Invalid goal');
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { goal, hasCompletedOnboarding: true },
    { new: true }
  );
  if (!user) throw new NotFoundError('User not found');
  return getProfile(userId);
}

/**
 * Public owner profile (used by the Owner Profile page).
 */
export async function getPublicOwnerProfile(userId: string) {
  const user = await User.findById(userId).select('name avatar createdAt');
  if (!user) throw new NotFoundError('Owner not found');
  return {
    id: String(user._id),
    name: user.name,
    avatar: user.avatar,
    createdAt: (user as { createdAt?: Date }).createdAt,
  };
}
