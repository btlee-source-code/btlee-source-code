/**
 * Notifications Service
 */
import { Types } from 'mongoose';
import { Notification } from './notification.model.js';
import { User } from '../users/user.model.js';
import { sendExpoPush } from '../../shared/utils/pushNotifications.js';
import type { NotificationType } from '../../config/constants.js';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await Notification.create({
    user: new Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
  });
  // Also fire a device push — fire-and-forget so it never blocks/breaks the
  // in-app notification write (the source of truth).
  void pushToUserDevices(input);
  return notification;
}

/** Best-effort device push for a notification; prunes tokens Expo rejects. */
async function pushToUserDevices(input: CreateNotificationInput): Promise<void> {
  try {
    const user = await User.findById(input.userId).select('+expoPushTokens').lean();
    const tokens = user?.expoPushTokens ?? [];
    if (!tokens.length) return;

    const invalid = await sendExpoPush(
      tokens.map((to) => ({
        to,
        title: input.title,
        body: input.message,
        data: { type: input.type, link: input.link ?? null },
      }))
    );
    if (invalid.length) {
      await User.updateOne(
        { _id: input.userId },
        { $pull: { expoPushTokens: { $in: invalid } } }
      );
    }
  } catch (err) {
    console.error('[push] notification push failed', err);
  }
}

/**
 * Register a device's Expo push token to a user. First detaches the token from
 * any other account (device re-used by a different login) so pushes always reach
 * the currently signed-in user, then adds it (deduped) to this user.
 */
export async function registerPushToken(userId: string, token: string): Promise<void> {
  await User.updateMany(
    { _id: { $ne: userId }, expoPushTokens: token },
    { $pull: { expoPushTokens: token } }
  );
  await User.updateOne({ _id: userId }, { $addToSet: { expoPushTokens: token } });
}

export async function unregisterPushToken(userId: string, token: string): Promise<void> {
  await User.updateOne({ _id: userId }, { $pull: { expoPushTokens: token } });
}

export async function getMyNotifications(userId: string, limit = 30) {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ user: userId, isRead: false });
}

export async function markAsRead(userId: string, notificationId: string) {
  await Notification.updateOne(
    { _id: notificationId, user: userId },
    { isRead: true }
  );
}

export async function markAllAsRead(userId: string) {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
}
