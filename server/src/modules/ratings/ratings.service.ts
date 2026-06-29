/**
 * Ratings Service
 * Users rate approved properties 1–5. Each user has a single, updatable rating
 * per property; the property's denormalized ratingAvg/ratingCount are recomputed
 * from the Rating collection after every change.
 */
import { Types } from 'mongoose';
import { Rating } from './rating.model.js';
import { Property } from '../properties/property.model.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/errors/AppError.js';

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

  await Rating.findOneAndUpdate(
    { user: new Types.ObjectId(userId), property: new Types.ObjectId(propertyId) },
    { value },
    { upsert: true, setDefaultsOnInsert: true }
  );

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
