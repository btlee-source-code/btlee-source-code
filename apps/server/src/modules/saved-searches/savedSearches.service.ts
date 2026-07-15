/**
 * Saved Searches Service
 */
import { Types } from 'mongoose';
import { SavedSearch } from './savedSearch.model.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError.js';

interface CreateSavedSearchInput {
  name: string;
  search?: string | null;
  type?: string | null;
  listingType?: string | null;
  category?: string | null;
  governorate?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minBedrooms?: number | null;
  minArea?: number | null;
}

interface CreateCarSavedSearchInput {
  name: string;
  search?: string | null;
  listingType?: string | null;
  governorate?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  condition?: string | null;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  minYear?: number | null;
  maxYear?: number | null;
  maxMileage?: number | null;
}

/** List the user's saved searches, optionally scoped to one domain. */
export async function getMySavedSearches(userId: string, targetType?: 'property' | 'car') {
  const filter: Record<string, unknown> = { user: userId };
  if (targetType === 'car') filter.targetType = 'car';
  // Property scope (or unscoped legacy rows) — anything that isn't a car search.
  else if (targetType === 'property') filter.targetType = { $ne: 'car' };
  return SavedSearch.find(filter).sort({ createdAt: -1 }).lean();
}

export async function createSavedSearch(userId: string, input: CreateSavedSearchInput) {
  return SavedSearch.create({
    user: new Types.ObjectId(userId),
    targetType: 'property',
    ...input,
  });
}

export async function createCarSavedSearch(userId: string, input: CreateCarSavedSearchInput) {
  return SavedSearch.create({
    user: new Types.ObjectId(userId),
    targetType: 'car',
    ...input,
  });
}

export async function deleteSavedSearch(userId: string, id: string) {
  const search = await SavedSearch.findById(id);
  if (!search) throw new NotFoundError('Saved search not found');
  if (String(search.user) !== userId) throw new ForbiddenError();
  await search.deleteOne();
}
