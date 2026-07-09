/**
 * Notifications Service
 */
import { Types } from 'mongoose';
import { Notification } from './notification.model.js';
import type { NotificationType } from '../../config/constants.js';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
}

export async function createNotification(input: CreateNotificationInput) {
  return Notification.create({
    user: new Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
  });
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
