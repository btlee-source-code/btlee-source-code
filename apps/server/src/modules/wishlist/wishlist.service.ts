/**
 * Wishlist Service
 * Manages user's saved properties. Stored as array of refs on the user document.
 */
import { Types } from 'mongoose';
import { User } from '../users/user.model.js';
import { Property } from '../properties/property.model.js';
import { Car } from '../cars/car.model.js';
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

// --- Cars — parallel `carWishlist` array (same shape, separate domain) ---

export async function getCarWishlist(userId: string) {
  const user = await User.findById(userId).populate({
    path: 'carWishlist',
    match: { status: 'approved' },
    populate: { path: 'owner', select: 'name avatar' },
  });
  if (!user) throw new NotFoundError('User not found');
  return user.carWishlist;
}

export async function addCarToWishlist(userId: string, carId: string) {
  const car = await Car.findById(carId).select('_id');
  if (!car) throw new NotFoundError('Car not found');

  await User.updateOne(
    { _id: userId },
    { $addToSet: { carWishlist: new Types.ObjectId(carId) } }
  );
}

export async function removeCarFromWishlist(userId: string, carId: string) {
  await User.updateOne(
    { _id: userId },
    { $pull: { carWishlist: new Types.ObjectId(carId) } }
  );
}

export async function isCarInWishlist(userId: string, carId: string): Promise<boolean> {
  const user = await User.findOne({
    _id: userId,
    carWishlist: new Types.ObjectId(carId),
  }).select('_id');
  return Boolean(user);
}
