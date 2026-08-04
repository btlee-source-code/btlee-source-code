import { Types } from 'mongoose';
import { Notification } from './notification.model.js';
import { PushDelivery } from './pushDelivery.model.js';
import { User } from '../users/user.model.js';
import {
  getExpoPushReceipts,
  isExpoPushToken,
  sendExpoPush,
  type PushMessage,
} from '../../shared/utils/pushNotifications.js';

const BATCH_SIZE = 100;
const MAX_SEND_ATTEMPTS = 6;
const MAX_RECEIPT_ATTEMPTS = 12;
const RECEIPT_DELAY_MS = 15 * 60 * 1000;

let processing: Promise<void> | null = null;

function sendRetryAt(attempts: number): Date {
  const delayMinutes = Math.min(2 ** Math.max(0, attempts - 1), 60);
  return new Date(Date.now() + delayMinutes * 60 * 1000);
}

function receiptRetryAt(): Date {
  return new Date(Date.now() + RECEIPT_DELAY_MS);
}

function terminalUpdate(
  status: 'delivered' | 'failed' | 'cancelled' | 'unknown',
  errorCode?: string,
  errorMessage?: string
) {
  return {
    status,
    nextAttemptAt: null,
    completedAt: new Date(),
    lastErrorCode: errorCode ?? null,
    lastErrorMessage: errorMessage ?? null,
  };
}

export async function enqueueNotificationPush(
  notificationId: string,
  userId: string
): Promise<number> {
  const user = await User.findById(userId).select('+expoPushTokens').lean();
  const tokens = [...new Set((user?.expoPushTokens ?? []).filter(isExpoPushToken))];
  if (!tokens.length) return 0;

  await PushDelivery.bulkWrite(
    tokens.map((token) => ({
      updateOne: {
        filter: { notification: notificationId, token },
        update: {
          $setOnInsert: {
            notification: new Types.ObjectId(notificationId),
            user: new Types.ObjectId(userId),
            token,
            status: 'queued',
            nextAttemptAt: new Date(),
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  return tokens.length;
}

export async function cancelPushDeliveriesForToken(
  token: string,
  exceptUserId?: string
): Promise<void> {
  const filter: Record<string, unknown> = {
    token,
    status: { $in: ['queued', 'awaiting_receipt'] },
  };
  if (exceptUserId) filter.user = { $ne: new Types.ObjectId(exceptUserId) };
  await PushDelivery.updateMany(filter, { $set: terminalUpdate('cancelled') });
}

async function removeInvalidToken(token: string): Promise<void> {
  await Promise.all([
    User.updateMany({ expoPushTokens: token }, { $pull: { expoPushTokens: token } }),
    cancelPushDeliveriesForToken(token),
  ]);
}

async function processQueuedDeliveries(): Promise<void> {
  const deliveries = await PushDelivery.find({
    status: 'queued',
    nextAttemptAt: { $lte: new Date() },
  })
    .select('+token')
    .sort({ nextAttemptAt: 1 })
    .limit(BATCH_SIZE)
    .lean();
  if (!deliveries.length) return;

  const notificationIds = deliveries.map((delivery) => delivery.notification);
  const userIds = deliveries.map((delivery) => delivery.user);
  const [notifications, users] = await Promise.all([
    Notification.find({ _id: { $in: notificationIds } }).lean(),
    User.find({ _id: { $in: userIds } }).select('+expoPushTokens').lean(),
  ]);
  const notificationById = new Map(
    notifications.map((notification) => [String(notification._id), notification])
  );
  const tokensByUserId = new Map(
    users.map((user) => [String(user._id), new Set(user.expoPushTokens ?? [])])
  );

  const activeDeliveries: typeof deliveries = [];
  const messages: PushMessage[] = [];

  for (const delivery of deliveries) {
    const notification = notificationById.get(String(delivery.notification));
    const tokenStillRegistered = tokensByUserId.get(String(delivery.user))?.has(delivery.token);
    if (!notification || !tokenStillRegistered) {
      await PushDelivery.updateOne(
        { _id: delivery._id, status: 'queued' },
        {
          $set: terminalUpdate(
            'cancelled',
            notification ? 'TokenUnregistered' : 'NotificationNotFound'
          ),
        }
      );
      continue;
    }

    activeDeliveries.push(delivery);
    messages.push({
      to: delivery.token,
      title: notification.title,
      body: notification.message,
      data: { type: notification.type, link: notification.link ?? null },
      sound: 'default',
      priority: 'high',
      channelId: 'default',
      ttl: 24 * 60 * 60,
    });
  }

  const results = await sendExpoPush(messages);
  const invalidTokens = new Set<string>();

  await Promise.all(
    activeDeliveries.map(async (delivery, index) => {
      const result = results[index];
      const sendAttempts = delivery.sendAttempts + 1;

      if (result?.status === 'accepted' && result.ticketId) {
        await PushDelivery.updateOne(
          { _id: delivery._id, status: 'queued' },
          {
            $set: {
              status: 'awaiting_receipt',
              ticketId: result.ticketId,
              sendAttempts,
              receiptAttempts: 0,
              nextAttemptAt: receiptRetryAt(),
              lastErrorCode: null,
              lastErrorMessage: null,
            },
          }
        );
        return;
      }

      const retryable = Boolean(result?.retryable) && sendAttempts < MAX_SEND_ATTEMPTS;
      if (result?.errorCode === 'DeviceNotRegistered') invalidTokens.add(delivery.token);
      await PushDelivery.updateOne(
        { _id: delivery._id, status: 'queued' },
        {
          $set: retryable
            ? {
                status: 'queued',
                sendAttempts,
                nextAttemptAt: sendRetryAt(sendAttempts),
                lastErrorCode: result?.errorCode ?? null,
                lastErrorMessage: result?.errorMessage ?? 'Push send failed',
              }
            : {
                ...terminalUpdate(
                  'failed',
                  result?.errorCode,
                  result?.errorMessage ?? 'Push send failed'
                ),
                sendAttempts,
              },
        }
      );
    })
  );

  await Promise.all([...invalidTokens].map(removeInvalidToken));
}

async function processReceiptDeliveries(): Promise<void> {
  const deliveries = await PushDelivery.find({
    status: 'awaiting_receipt',
    ticketId: { $type: 'string' },
    nextAttemptAt: { $lte: new Date() },
  })
    .select('+token')
    .sort({ nextAttemptAt: 1 })
    .limit(BATCH_SIZE)
    .lean();
  if (!deliveries.length) return;

  const ticketIds = deliveries
    .map((delivery) => delivery.ticketId)
    .filter((ticketId): ticketId is string => typeof ticketId === 'string');

  let receipts;
  try {
    receipts = await getExpoPushReceipts(ticketIds);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Receipt request failed';
    await Promise.all(
      deliveries.map((delivery) => {
        const receiptAttempts = delivery.receiptAttempts + 1;
        return PushDelivery.updateOne(
          { _id: delivery._id, status: 'awaiting_receipt' },
          {
            $set:
              receiptAttempts >= MAX_RECEIPT_ATTEMPTS
                ? {
                    ...terminalUpdate('unknown', 'ReceiptUnavailable', message),
                    receiptAttempts,
                  }
                : {
                    receiptAttempts,
                    nextAttemptAt: receiptRetryAt(),
                    lastErrorCode: 'ReceiptUnavailable',
                    lastErrorMessage: message,
                  },
          }
        );
      })
    );
    return;
  }

  const invalidTokens = new Set<string>();
  await Promise.all(
    deliveries.map(async (delivery) => {
      const ticketId = delivery.ticketId;
      if (!ticketId) return;
      const receipt = receipts[ticketId] ?? { status: 'pending', retryable: true };
      const receiptAttempts = delivery.receiptAttempts + 1;

      if (receipt.status === 'delivered') {
        await PushDelivery.updateOne(
          { _id: delivery._id, status: 'awaiting_receipt' },
          { $set: { ...terminalUpdate('delivered'), receiptAttempts } }
        );
        return;
      }

      if (receipt.errorCode === 'DeviceNotRegistered') invalidTokens.add(delivery.token);

      if (receipt.status === 'error' && receipt.retryable && delivery.sendAttempts < MAX_SEND_ATTEMPTS) {
        await PushDelivery.updateOne(
          { _id: delivery._id, status: 'awaiting_receipt' },
          {
            $set: {
              status: 'queued',
              ticketId: null,
              receiptAttempts,
              nextAttemptAt: sendRetryAt(delivery.sendAttempts),
              lastErrorCode: receipt.errorCode ?? null,
              lastErrorMessage: receipt.errorMessage ?? 'Retryable delivery failure',
            },
          }
        );
        return;
      }

      const stillPending = receipt.status === 'pending' && receiptAttempts < MAX_RECEIPT_ATTEMPTS;
      await PushDelivery.updateOne(
        { _id: delivery._id, status: 'awaiting_receipt' },
        {
          $set: stillPending
            ? {
                receiptAttempts,
                nextAttemptAt: receiptRetryAt(),
              }
            : {
                ...terminalUpdate(
                  receipt.status === 'pending' ? 'unknown' : 'failed',
                  receipt.errorCode ?? (receipt.status === 'pending' ? 'ReceiptTimedOut' : undefined),
                  receipt.errorMessage
                ),
                receiptAttempts,
              },
        }
      );
    })
  );

  await Promise.all([...invalidTokens].map(removeInvalidToken));
}

async function processOnce(): Promise<void> {
  await processQueuedDeliveries();
  await processReceiptDeliveries();
}

/** Deduplicates overlapping triggers from new notifications and the timer job. */
export function processPushDeliveriesTick(): Promise<void> {
  if (!processing) {
    processing = processOnce()
      .catch((error) => {
        console.error('[push] delivery worker failed', error);
      })
      .finally(() => {
        processing = null;
      });
  }
  return processing;
}
