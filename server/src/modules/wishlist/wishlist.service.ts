/**
 * Wishlist Service
 * Manages user's saved properties. Stored as array of refs on the user document.
 */
import { Types } from 'mongoose';
import { User } from '../users/user.model.js';
import { Property } from '../properties/property.model.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function getWishlist(userId: string) {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    match: { status: 'approved' },
    populate: { path: 'owner', select: 'name avatar' },
  });
  if (!user) throw new NotFoundError('User not found');
  return user.wishlist;
}

export async function addToWishlist(userId: string, propertyId: string) {
  const property = await Property.findById(propertyId);
  if (!property) throw new NotFoundError('Property not found');

  await User.updateOne(
    { _id: userId },
    { $addToSet: { wishlist: new Types.ObjectId(propertyId) } }
  );
}

export async function removeFromWishlist(userId: string, propertyId: string) {
  await User.updateOne(
    { _id: userId },
    { $pull: { wishlist: new Types.ObjectId(propertyId) } }
  );
}

export async function isInWishlist(userId: string, propertyId: string): Promise<boolean> {
  const user = await User.findOne({
    _id: userId,
    wishlist: new Types.ObjectId(propertyId),
  }).select('_id');
  return Boolean(user);
}
