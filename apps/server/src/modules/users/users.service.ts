/**
 * Users Service
 * Profile management, onboarding completion, account updates.
 */
import { User } from './user.model.js';
import { Property } from '../properties/property.model.js';
import { Car } from '../cars/car.model.js';
import { Rating } from '../ratings/rating.model.js';
import { Report } from '../reports/report.model.js';
import { SavedSearch } from '../saved-searches/savedSearch.model.js';
import { Notification } from '../notifications/notification.model.js';
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
 * Permanently delete a user's account and everything tied to it.
 *
 * Required by the app stores (Google Play / Apple) for any app with accounts,
 * and matches the promise in the in-app "data deletion" page. Wipes the user's
 * listings, ratings, reports, saved searches and notifications, detaches their
 * id from other users' wishlists, then removes the account itself (which also
 * drops their refresh tokens and push tokens). Irreversible.
 */
export async function deleteAccount(userId: string): Promise<void> {
  const user = await User.findById(userId).select('_id');
  if (!user) throw new NotFoundError('User not found');

  // Independent collections keyed by this user — order doesn't matter. Any refs
  // to this user's now-deleted listings left in other users' wishlists are
  // harmless: wishlist reads populate with `match:{status:'approved'}`, so a
  // missing listing simply drops out.
  await Promise.all([
    Property.deleteMany({ owner: userId }),
    Car.deleteMany({ owner: userId }),
    Rating.deleteMany({ user: userId }),
    Report.deleteMany({ reporter: userId }),
    SavedSearch.deleteMany({ user: userId }),
    Notification.deleteMany({ user: userId }),
  ]);

  await User.deleteOne({ _id: userId });
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
