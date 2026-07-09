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

export async function getMySavedSearches(userId: string) {
  return SavedSearch.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export async function createSavedSearch(userId: string, input: CreateSavedSearchInput) {
  return SavedSearch.create({
    user: new Types.ObjectId(userId),
    ...input,
  });
}

export async function deleteSavedSearch(userId: string, id: string) {
  const search = await SavedSearch.findById(id);
  if (!search) throw new NotFoundError('Saved search not found');
  if (String(search.user) !== userId) throw new ForbiddenError();
  await search.deleteOne();
}
