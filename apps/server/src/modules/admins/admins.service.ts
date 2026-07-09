/**
 * Admins Service
 * Dashboard stats, user management, listing review actions.
 */
import { Property } from '../properties/property.model.js';
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
    reports: { open: openReports },
  };
}

export async function listUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments({}),
  ]);
  return { items, total };
}

export async function blockUser(userId: string, isBlocked: boolean) {
  const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });
  if (!user) throw new NotFoundError('User not found');
  return user;
}
