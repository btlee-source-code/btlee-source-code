/**
 * Admins Service
 * Dashboard stats, user management, listing review actions.
 */
import { Property } from '../properties/property.model.js';
import { Car } from '../cars/car.model.js';
import { User } from '../users/user.model.js';
import { Report } from '../reports/report.model.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function getDashboardStats() {
  const [
    totalUsers,
    blockedUsers,
    totalProperties,
    pendingProperties,
    approvedProperties,
    rejectedProperties,
    soldProperties,
    rentedProperties,
    openReports,
    featuredCount,
    totalCars,
    pendingCars,
    approvedCars,
    rejectedCars,
    soldCars,
    rentedCars,
    featuredCars,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isBlocked: true }),
    Property.countDocuments({}),
    Property.countDocuments({ status: 'pending' }),
    Property.countDocuments({ status: 'approved' }),
    Property.countDocuments({ status: 'rejected' }),
    Property.countDocuments({ status: 'sold' }),
    Property.countDocuments({ status: 'rented' }),
    Report.countDocuments({ status: 'open' }),
    Property.countDocuments({ isFeatured: true, status: 'approved' }),
    Car.countDocuments({}),
    Car.countDocuments({ status: 'pending' }),
    Car.countDocuments({ status: 'approved' }),
    Car.countDocuments({ status: 'rejected' }),
    Car.countDocuments({ status: 'sold' }),
    Car.countDocuments({ status: 'rented' }),
    Car.countDocuments({ isFeatured: true, status: 'approved' }),
  ]);

  return {
    users: { total: totalUsers, blocked: blockedUsers },
    properties: {
      total: totalProperties,
      pending: pendingProperties,
      approved: approvedProperties,
      rejected: rejectedProperties,
      sold: soldProperties,
      rented: rentedProperties,
      featured: featuredCount,
    },
    cars: {
      total: totalCars,
      pending: pendingCars,
      approved: approvedCars,
      rejected: rejectedCars,
      sold: soldCars,
      rented: rentedCars,
      featured: featuredCars,
    },
    reports: { open: openReports },
  };
}

export async function listUsers(page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;

  // Optional name/email/phone search. Escape regex metacharacters so a typed
  // query is matched literally (and can't act as an injected pattern).
  const q = search?.trim();
  const filter: Record<string, unknown> = {};
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { items, total };
}

export async function blockUser(userId: string, isBlocked: boolean) {
  const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });
  if (!user) throw new NotFoundError('User not found');
  return user;
}
