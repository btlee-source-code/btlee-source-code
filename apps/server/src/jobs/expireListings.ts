/**
 * Expire property and car listings and notify each owner exactly once.
 *
 * The pending flag makes the operation restart-safe: status transition and the
 * need for a notification are written atomically, while Notification.dedupeKey
 * prevents duplicates if the process stops between notification creation and
 * clearing the flag.
 */
import { Car } from '../modules/cars/car.model.js';
import { createNotification } from '../modules/notifications/notifications.service.js';
import { Property } from '../modules/properties/property.model.js';
import { User } from '../modules/users/user.model.js';
import type { UserLanguage } from '../config/constants.js';

async function getOwnerLanguages(ownerIds: unknown[]): Promise<Map<string, UserLanguage>> {
  const ids = [...new Set(ownerIds.map(String))];
  const users = await User.find({ _id: { $in: ids } }).select('preferredLanguage').lean();
  return new Map(
    users.map((user) => [
      String(user._id),
      user.preferredLanguage === 'en' ? 'en' : 'ar',
    ])
  );
}

function propertyExpiryCopy(language: UserLanguage, listingName: string) {
  return language === 'en'
    ? {
        title: 'Your listing has expired',
        message: `Your property listing "${listingName}" has expired. You can renew it from My Listings.`,
      }
    : {
        title: 'انتهت مدة إعلانك',
        message: `انتهت مدة إعلان عقارك "${listingName}". يمكنك تجديد الإعلان من صفحة إعلاناتي.`,
      };
}

function carExpiryCopy(language: UserLanguage, listingName: string) {
  return language === 'en'
    ? {
        title: 'Your listing has expired',
        message: `Your car listing "${listingName}" has expired. You can renew it from My Listings.`,
      }
    : {
        title: 'انتهت مدة إعلانك',
        message: `انتهت مدة إعلان عربيتك "${listingName}". يمكنك تجديد الإعلان من صفحة إعلاناتي.`,
      };
}

async function notifyExpiredProperties(): Promise<number> {
  const properties = await Property.find({
    status: 'expired',
    expiryNotificationPending: true,
  })
    .select('_id owner area_name')
    .lean();
  const ownerLanguages = await getOwnerLanguages(properties.map((property) => property.owner));

  let notified = 0;
  for (const property of properties) {
    try {
      const userId = String(property.owner);
      const copy = propertyExpiryCopy(
        ownerLanguages.get(userId) ?? 'ar',
        property.area_name
      );
      await createNotification({
        userId,
        type: 'listing_expired',
        title: copy.title,
        message: copy.message,
        link: `/properties/${property._id}`,
        dedupeKey: `property-expired:${property._id}`,
      });
      await Property.updateOne(
        { _id: property._id, expiryNotificationPending: true },
        {
          $set: {
            expiryNotificationPending: false,
            expiryNotificationSentAt: new Date(),
          },
        }
      );
      notified += 1;
    } catch (error) {
      console.error('[jobs] property expiry notification failed', property._id, error);
    }
  }
  return notified;
}

async function notifyExpiredCars(): Promise<number> {
  const cars = await Car.find({
    status: 'expired',
    expiryNotificationPending: true,
  })
    .select('_id owner make model')
    .lean();
  const ownerLanguages = await getOwnerLanguages(cars.map((car) => car.owner));

  let notified = 0;
  for (const car of cars) {
    try {
      const userId = String(car.owner);
      const label = `${car.make} ${car.model}`.trim();
      const copy = carExpiryCopy(ownerLanguages.get(userId) ?? 'ar', label);
      await createNotification({
        userId,
        type: 'listing_expired',
        title: copy.title,
        message: copy.message,
        link: `/cars/${car._id}`,
        dedupeKey: `car-expired:${car._id}`,
      });
      await Car.updateOne(
        { _id: car._id, expiryNotificationPending: true },
        {
          $set: {
            expiryNotificationPending: false,
            expiryNotificationSentAt: new Date(),
          },
        }
      );
      notified += 1;
    } catch (error) {
      console.error('[jobs] car expiry notification failed', car._id, error);
    }
  }
  return notified;
}

export async function expireListingsTick(): Promise<void> {
  const now = new Date();
  const [propertyResult, carResult] = await Promise.all([
    Property.updateMany(
      { status: 'approved', expiresAt: { $lte: now } },
      { $set: { status: 'expired', expiryNotificationPending: true } }
    ),
    Car.updateMany(
      { status: 'approved', expiresAt: { $lte: now } },
      { $set: { status: 'expired', expiryNotificationPending: true } }
    ),
  ]);

  const [propertyNotifications, carNotifications] = await Promise.all([
    notifyExpiredProperties(),
    notifyExpiredCars(),
  ]);

  const expired = propertyResult.modifiedCount + carResult.modifiedCount;
  const notified = propertyNotifications + carNotifications;
  if (expired > 0 || notified > 0) {
    console.log(
      `[jobs] Expired ${expired} listings and created ${notified} expiry notifications`
    );
  }
}

let interval: NodeJS.Timeout | null = null;

export function startExpireListingsJob(): void {
  void expireListingsTick().catch((error) => console.error('[jobs] expire failed', error));
  interval = setInterval(() => {
    void expireListingsTick().catch((error) => console.error('[jobs] expire failed', error));
  }, 60 * 60 * 1000);
}

export function stopExpireListingsJob(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
