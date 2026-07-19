/**
 * Ratings Service
 * Users rate approved listings 1–5. Each user can submit exactly one immutable
 * rating per listing; denormalized ratingAvg/ratingCount values are recomputed
 * from the Rating collection after each new rating.
 */
import { Types } from 'mongoose';
import { Rating } from './rating.model.js';
import { Property } from '../properties/property.model.js';
import { Car } from '../cars/car.model.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../../shared/errors/AppError.js';

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}

/**
 * Recompute and persist a property's rating aggregates from the source-of-truth
 * Rating collection. Returns the fresh aggregates.
 */
async function recomputeAggregates(
  propertyId: string
): Promise<{ ratingAvg: number; ratingCount: number }> {
  const [agg] = await Rating.aggregate<{ avg: number; count: number }>([
    { $match: { property: new Types.ObjectId(propertyId) } },
    { $group: { _id: null, avg: { $avg: '$value' }, count: { $sum: 1 } } },
  ]);

  const ratingAvg = agg ? Math.round(agg.avg * 10) / 10 : 0; // one decimal
  const ratingCount = agg ? agg.count : 0;

  await Property.updateOne({ _id: propertyId }, { ratingAvg, ratingCount });
  return { ratingAvg, ratingCount };
}

export async function rateProperty(userId: string, propertyId: string, value: number) {
  const property = await Property.findById(propertyId).select('owner status');
  if (!property) throw new NotFoundError('Property not found');
  if (String(property.owner) === userId) {
    throw new ForbiddenError('You cannot rate your own property');
  }
  if (property.status !== 'approved') {
    throw new BadRequestError('Only approved properties can be rated');
  }

  const propertyOid = new Types.ObjectId(propertyId);
  const userOid = new Types.ObjectId(userId);
  const existing = await Rating.exists({ user: userOid, property: propertyOid });
  if (existing) throw new ConflictError('لقد قيّمت هذا العقار من قبل');

  try {
    await Rating.create({
      user: userOid,
      targetType: 'property',
      targetId: propertyOid,
      property: propertyOid,
      value,
    });
  } catch (error) {
    // The unique index closes the race between the existence check and insert.
    if (isDuplicateKeyError(error)) throw new ConflictError('لقد قيّمت هذا العقار من قبل');
    throw error;
  }

  const stats = await recomputeAggregates(propertyId);
  return { ...stats, myRating: value };
}

export async function getMyRating(userId: string, propertyId: string): Promise<number | null> {
  const rating = await Rating.findOne({
    user: new Types.ObjectId(userId),
    property: new Types.ObjectId(propertyId),
  })
    .select('value')
    .lean();
  return rating ? rating.value : null;
}

// ---------------------------------------------------------------------------
// Cars — same collection, addressed via the domain-agnostic {targetType,targetId}
// keys (no `property` field), so a user has exactly one rating per car.
// ---------------------------------------------------------------------------

/** Recompute + persist a car's rating aggregates from the Rating collection. */
async function recomputeCarAggregates(
  carId: string
): Promise<{ ratingAvg: number; ratingCount: number }> {
  const [agg] = await Rating.aggregate<{ avg: number; count: number }>([
    { $match: { targetType: 'car', targetId: new Types.ObjectId(carId) } },
    { $group: { _id: null, avg: { $avg: '$value' }, count: { $sum: 1 } } },
  ]);

  const ratingAvg = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const ratingCount = agg ? agg.count : 0;

  await Car.updateOne({ _id: carId }, { ratingAvg, ratingCount });
  return { ratingAvg, ratingCount };
}

export async function rateCar(userId: string, carId: string, value: number) {
  const car = await Car.findById(carId).select('owner status');
  if (!car) throw new NotFoundError('Car not found');
  if (String(car.owner) === userId) {
    throw new ForbiddenError('You cannot rate your own car');
  }
  if (car.status !== 'approved') {
    throw new BadRequestError('Only approved cars can be rated');
  }

  const carOid = new Types.ObjectId(carId);
  const userOid = new Types.ObjectId(userId);
  const target = { user: userOid, targetType: 'car' as const, targetId: carOid };
  const existing = await Rating.exists(target);
  if (existing) throw new ConflictError('لقد قيّمت هذه العربية من قبل');

  try {
    // `property` is intentionally omitted so the partial legacy index skips it.
    await Rating.create({ ...target, value });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError('لقد قيّمت هذه العربية من قبل');
    throw error;
  }

  const stats = await recomputeCarAggregates(carId);
  return { ...stats, myRating: value };
}

export async function getMyCarRating(userId: string, carId: string): Promise<number | null> {
  const rating = await Rating.findOne({
    user: new Types.ObjectId(userId),
    targetType: 'car',
    targetId: new Types.ObjectId(carId),
  })
    .select('value')
    .lean();
  return rating ? rating.value : null;
}
