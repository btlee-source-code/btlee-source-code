/**
 * Cars Service
 * Business logic for the car-listing lifecycle:
 *   pending → approved → (sold/rented or expired)
 *           ↘ rejected → (edit & resubmit) → pending
 *
 * Mirrors the properties service. Search is a straightforward Arabic-tolerant
 * regex over make / model / description — cars don't need the property domain's
 * synonym engine, so this stays deliberately simple.
 */
import { Types } from 'mongoose';
import { Car } from './car.model.js';
import { getNextSequence } from '../../shared/models/counter.model.js';
import { cloudinary } from '../../config/cloudinary.js';
import { sendEmail } from '../../shared/utils/email.js';
import { createNotification } from '../notifications/notifications.service.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/errors/AppError.js';
import type {
  CreateCarInput,
  UpdateCarInput,
  CarListQuery,
} from './cars.validators.js';
import { resolveCarSearch, buildCarTextClause } from './carSearchHelpers.js';

/** Escapes a user string so it can be used literally inside a RegExp. */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a Mongoose filter from the public list-query params.
 * Used by both the public listing endpoint and the admin listing endpoint.
 */
function buildPublicFilter(query: CarListQuery) {
  const filter: Record<string, unknown> = { status: 'approved' };

  if (query.listingType) filter.listingType = query.listingType;
  if (query.condition) filter.condition = query.condition;
  if (query.make) filter.make = { $regex: escapeRegex(query.make), $options: 'i' };
  if (query.bodyType) filter.bodyType = query.bodyType;
  if (query.fuelType) filter.fuelType = query.fuelType;
  if (query.transmission) filter.transmission = query.transmission;
  if (query.governorate) filter.governorate = query.governorate;
  if (query.featured) filter.isFeatured = true;

  if (query.minYear !== undefined || query.maxYear !== undefined) {
    const yearFilter: Record<string, number> = {};
    if (query.minYear !== undefined) yearFilter.$gte = query.minYear;
    if (query.maxYear !== undefined) yearFilter.$lte = query.maxYear;
    filter.year = yearFilter;
  }

  if (query.maxMileage !== undefined) {
    filter.mileage = { $lte: query.maxMileage };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
    if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
    filter.price = priceFilter;
  }

  // Smart bilingual (Arabic/English) search:
  //   1. Map make/model + body/fuel/transmission/condition/listing words to enum
  //      filters — but only when the user hasn't pinned them via an explicit filter.
  //   2. Whatever is left → fuzzy regex over make/model/description, with
  //      recognized makes/models expanded to ALL language variants so "تويوتا"
  //      and "toyota" return the same cars.
  const andClauses: Record<string, unknown>[] = [];
  if (query.search && query.search.trim()) {
    const resolved = resolveCarSearch(query.search);
    if (resolved.listingTypes.length && !query.listingType)
      andClauses.push({ listingType: { $in: resolved.listingTypes } });
    if (resolved.conditions.length && !query.condition)
      andClauses.push({ condition: { $in: resolved.conditions } });
    if (resolved.bodyTypes.length && !query.bodyType)
      andClauses.push({ bodyType: { $in: resolved.bodyTypes } });
    if (resolved.fuelTypes.length && !query.fuelType)
      andClauses.push({ fuelType: { $in: resolved.fuelTypes } });
    if (resolved.transmissions.length && !query.transmission)
      andClauses.push({ transmission: { $in: resolved.transmissions } });

    const textClause = buildCarTextClause(resolved);
    if (textClause) andClauses.push(textClause);
  }

  if (andClauses.length) filter.$and = andClauses;

  return filter;
}

function buildSort(sort: CarListQuery['sort']): Record<string, 1 | -1> {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

export async function listCars(query: CarListQuery) {
  const filter = buildPublicFilter(query);
  const sort = buildSort(query.sort);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Car.find(filter)
      .populate('owner', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, query.page, query.limit),
  };
}

// Home sections rank by rating first (with recency as the tie-breaker), so on a
// fresh catalogue this behaves like "newest first" and re-orders as ratings
// come in — same convention as the properties service.
const RATING_FIRST_SORT = { ratingAvg: -1, createdAt: -1 } as const;

export async function getFeatured(limit = 8) {
  return Car.find({ status: 'approved', isFeatured: true })
    .populate('owner', 'name avatar')
    .sort(RATING_FIRST_SORT)
    .limit(limit)
    .lean();
}

export async function getLatest(limit = 8) {
  return Car.find({ status: 'approved' })
    .populate('owner', 'name avatar')
    .sort(RATING_FIRST_SORT)
    .limit(limit)
    .lean();
}

export async function getCarById(id: string, viewerId?: string) {
  // Public endpoint — never expose the owner's email (PII). Contact happens
  // via the listing's whatsappNumber. Only name + avatar are needed.
  const car = await Car.findById(id).populate('owner', 'name avatar');
  if (!car) throw new NotFoundError('Car not found');

  // The owner ref can be null if the owner's account was deleted (orphaned listing).
  const ownerId = car.owner ? String(car.owner._id) : null;

  // Only the owner (or admin elsewhere) can see non-approved listings.
  if (car.status !== 'approved') {
    if (!viewerId || ownerId !== viewerId) {
      throw new NotFoundError('Car not found');
    }
  }

  // Increment view count (fire-and-forget — don't await).
  if (car.status === 'approved' && (!viewerId || ownerId !== viewerId)) {
    Car.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).catch(() => {});
  }

  return car;
}

export async function getSimilarCars(id: string, limit = 4) {
  const ref = await Car.findById(id).select('make bodyType price status').lean();
  if (!ref || ref.status !== 'approved') return [];

  // Match on a price band only when the reference listing actually has a price.
  const priceFilter =
    ref.price != null ? { price: { $gte: ref.price * 0.7, $lte: ref.price * 1.3 } } : {};

  return Car.find({
    _id: { $ne: id },
    status: 'approved',
    make: ref.make,
    bodyType: ref.bodyType,
    ...priceFilter,
  })
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getCarsByOwner(ownerId: string, limit = 12) {
  return Car.find({ owner: ownerId, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Creates a new car listing. Status is always 'pending' — admin must approve.
 * Computes expiresAt from durationDays.
 */
export async function createCar(ownerId: string, input: CreateCarInput) {
  const expiresAt = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000);
  const seq = await getNextSequence('car');

  const car = await Car.create({
    seq,
    owner: new Types.ObjectId(ownerId),
    listingType: input.listingType,
    condition: input.condition,
    make: input.make,
    model: input.model,
    year: input.year,
    mileage: input.mileage ?? null,
    transmission: input.transmission,
    fuelType: input.fuelType,
    bodyType: input.bodyType,
    color: input.color ?? null,
    price: input.price,
    governorate: input.governorate,
    area_name: input.area_name,
    ...(input.coordinates
      ? { location: { type: 'Point', coordinates: input.coordinates } }
      : {}),
    description: input.description,
    images: input.images,
    whatsappNumber: input.whatsappNumber,
    durationDays: input.durationDays,
    expiresAt,
    status: 'pending',
  });

  return car;
}

export async function getMyCars(ownerId: string) {
  return Car.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
}

/**
 * Updates a car listing. If it was rejected, resubmits it as pending.
 */
export async function updateCar(ownerId: string, id: string, input: UpdateCarInput) {
  const car = await Car.findById(id);
  if (!car) throw new NotFoundError('Car not found');
  if (String(car.owner) !== ownerId) {
    throw new ForbiddenError('You can only edit your own cars');
  }
  if (car.status === 'sold' || car.status === 'rented') {
    throw new BadRequestError('Cannot edit a car that is sold or rented');
  }

  const wasRejected = car.status === 'rejected';

  Object.assign(car, {
    ...(input.listingType !== undefined && { listingType: input.listingType }),
    ...(input.condition !== undefined && { condition: input.condition }),
    ...(input.make !== undefined && { make: input.make }),
    ...(input.model !== undefined && { model: input.model }),
    ...(input.year !== undefined && { year: input.year }),
    ...(input.mileage !== undefined && { mileage: input.mileage }),
    ...(input.transmission !== undefined && { transmission: input.transmission }),
    ...(input.fuelType !== undefined && { fuelType: input.fuelType }),
    ...(input.bodyType !== undefined && { bodyType: input.bodyType }),
    ...(input.color !== undefined && { color: input.color }),
    ...(input.price !== undefined && { price: input.price }),
    ...(input.governorate !== undefined && { governorate: input.governorate }),
    ...(input.area_name !== undefined && { area_name: input.area_name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.images !== undefined && { images: input.images }),
    ...(input.whatsappNumber !== undefined && { whatsappNumber: input.whatsappNumber }),
  });

  if (input.coordinates) {
    car.location = { type: 'Point', coordinates: input.coordinates };
  }

  if (input.durationDays) {
    car.durationDays = input.durationDays;
    car.expiresAt = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000);
  }

  // Resubmit for review if previously rejected.
  if (wasRejected) {
    car.status = 'pending';
    car.rejectionReason = null;
  }

  await car.save();
  return car;
}

/**
 * Owner deletes their car listing, cleaning up its Cloudinary images.
 */
export async function deleteCar(ownerId: string, id: string) {
  const car = await Car.findById(id);
  if (!car) throw new NotFoundError('Car not found');
  if (String(car.owner) !== ownerId) {
    throw new ForbiddenError('You can only delete your own cars');
  }

  await Promise.all(
    car.images.map((img) =>
      cloudinary.uploader.destroy(img.publicId).catch((err) => {
        console.error('[cloudinary] failed to delete', img.publicId, err);
      })
    )
  );

  await car.deleteOne();
}

/**
 * Admin removes any car listing (no owner check) and cleans up its images.
 */
export async function adminDeleteCar(id: string) {
  const car = await Car.findById(id);
  if (!car) throw new NotFoundError('Car not found');

  await Promise.all(
    car.images.map((img) =>
      cloudinary.uploader.destroy(img.publicId).catch((err) => {
        console.error('[cloudinary] failed to delete', img.publicId, err);
      })
    )
  );

  await car.deleteOne();
}

/**
 * Admin removes many car listings at once and cleans up their images.
 * Returns how many were actually deleted.
 */
export async function adminBulkDeleteCars(ids: string[]): Promise<{ deletedCount: number }> {
  const cars = await Car.find({ _id: { $in: ids } });
  if (cars.length === 0) return { deletedCount: 0 };

  await Promise.all(
    cars.flatMap((car) =>
      car.images.map((img) =>
        cloudinary.uploader.destroy(img.publicId).catch((err) => {
          console.error('[cloudinary] failed to delete', img.publicId, err);
        })
      )
    )
  );

  const result = await Car.deleteMany({ _id: { $in: cars.map((c) => c._id) } });
  return { deletedCount: result.deletedCount ?? 0 };
}

/**
 * Owner marks their car as sold or rented — it disappears from search.
 */
export async function markAsSoldOrRented(
  ownerId: string,
  id: string,
  status: 'sold' | 'rented'
) {
  const car = await Car.findById(id).populate('owner', 'name email');
  if (!car) throw new NotFoundError('Car not found');
  if (String(car.owner._id) !== ownerId) {
    throw new ForbiddenError('Only the owner can update this');
  }
  if (car.status !== 'approved') {
    throw new BadRequestError('Only approved cars can be marked as sold/rented');
  }

  car.status = status;
  await car.save();

  // Thank-you email — fire-and-forget (don't block the response on SMTP).
  const owner = car.owner as unknown as { email: string; name: string };
  void sendEmail({
    to: owner.email,
    subject: 'شكراً لك من بيت لي 🚗',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>مبروك على إتمام الصفقة!</h2>
        <p>عزيزي ${owner.name},</p>
        <p>نشكرك على استخدامك منصة بيت لي. تم تحديث حالة عربيتك إلى ${status === 'sold' ? 'مُباعة' : 'مؤجرة'} بنجاح.</p>
        <p>نتمنى لك التوفيق ونتطلع لخدمتك مرة أخرى.</p>
        <p style="margin-top:20px;color:#666;">— فريق بيت لي</p>
      </div>
    `,
  });

  return car;
}

/**
 * Admin approves or rejects a car. Triggers notification + email.
 */
export async function reviewCar(
  carId: string,
  decision: 'approved' | 'rejected',
  rejectionReason?: string
) {
  const car = await Car.findById(carId).populate('owner', 'name email');
  if (!car) throw new NotFoundError('Car not found');
  if (car.status !== 'pending') {
    throw new BadRequestError('Only pending cars can be reviewed');
  }

  car.status = decision;
  car.rejectionReason = decision === 'rejected' ? (rejectionReason ?? null) : null;
  await car.save();

  const owner = car.owner as unknown as { _id: unknown; email: string; name: string };
  const carLabel = `${car.make} ${car.model}`;

  await createNotification({
    userId: String(owner._id),
    type: decision === 'approved' ? 'listing_approved' : 'listing_rejected',
    title: decision === 'approved' ? 'تم قبول إعلانك' : 'تم رفض إعلانك',
    message:
      decision === 'approved'
        ? `تم قبول إعلان عربيتك "${carLabel}" وأصبح متاحاً على المنصة.`
        : `تم رفض إعلان عربيتك "${carLabel}". السبب: ${rejectionReason}`,
    link: `/cars/${car._id}`,
  });

  // Email — fire-and-forget so a slow/unreachable SMTP never blocks the admin's
  // approve/reject response. sendEmail catches and logs its own errors.
  void sendEmail({
    to: owner.email,
    subject: decision === 'approved' ? 'تم قبول إعلانك في بيت لي ✅' : 'تم رفض إعلانك في بيت لي',
    html:
      decision === 'approved'
        ? `<div dir="rtl"><h2>مبروك! تم قبول إعلانك</h2><p>عزيزي ${owner.name}, تم قبول إعلانك وأصبح ظاهراً للمستخدمين الآن.</p></div>`
        : `<div dir="rtl"><h2>تم رفض إعلانك</h2><p>عزيزي ${owner.name},</p><p><strong>السبب:</strong> ${rejectionReason}</p><p>يمكنك تعديل الإعلان وإعادة تقديمه من لوحة التحكم الخاصة بك.</p></div>`,
  });

  return car;
}

export async function setFeatured(carId: string, isFeatured: boolean) {
  const car = await Car.findByIdAndUpdate(carId, { isFeatured }, { new: true });
  if (!car) throw new NotFoundError('Car not found');
  return car;
}

/**
 * Admin list — includes non-approved cars.
 */
export async function adminListCars(query: CarListQuery & { status?: string }) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.listingType) filter.listingType = query.listingType;
  if (query.bodyType) filter.bodyType = query.bodyType;

  const sort = buildSort(query.sort);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Car.find(filter)
      .populate('owner', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, query.page, query.limit),
  };
}
