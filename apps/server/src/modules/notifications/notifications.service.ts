/** Notifications service: in-app records plus durable device delivery queue. */
import { Types } from 'mongoose';
import { Notification } from './notification.model.js';
import { User } from '../users/user.model.js';
import {
  cancelPushDeliveriesForToken,
  enqueueNotificationPush,
  processPushDeliveriesTick,
} from './pushDelivery.service.js';
import type { NotificationType } from '../../config/constants.js';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  dedupeKey?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const data = {
    user: new Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
    ...(input.dedupeKey ? { dedupeKey: input.dedupeKey } : {}),
  };
  const notification = input.dedupeKey
    ? await Notification.findOneAndUpdate(
        { dedupeKey: input.dedupeKey },
        { $setOnInsert: data },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    : await Notification.create(data);

  // Persist one delivery per registered device before kicking the asynchronous
  // worker. A server restart cannot lose queued pushes, while the in-app record
  // remains available even if queue creation unexpectedly fails.
  try {
    const queued = await enqueueNotificationPush(String(notification._id), input.userId);
    if (queued > 0) void processPushDeliveriesTick();
  } catch (error) {
    console.error('[push] failed to queue notification', notification._id, error);
  }

  return notification;
}

/**
 * Register a device token to exactly one account. Pending deliveries belonging
 * to a previous account on the same device are cancelled before reassignment.
 */
export async function registerPushToken(userId: string, token: string): Promise<void> {
  await cancelPushDeliveriesForToken(token, userId);
  await User.updateMany(
    { _id: { $ne: userId }, expoPushTokens: token },
    { $pull: { expoPushTokens: token } }
  );
  await User.updateOne({ _id: userId }, { $addToSet: { expoPushTokens: token } });
}

export async function unregisterPushToken(userId: string, token: string): Promise<void> {
  await Promise.all([
    User.updateOne({ _id: userId }, { $pull: { expoPushTokens: token } }),
    cancelPushDeliveriesForToken(token),
  ]);
}

/** Device-scoped cleanup used after an access token has expired or been cleared. */
export async function unregisterPushTokenEverywhere(token: string): Promise<void> {
  await Promise.all([
    User.updateMany({ expoPushTokens: token }, { $pull: { expoPushTokens: token } }),
    cancelPushDeliveriesForToken(token),
  ]);
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
