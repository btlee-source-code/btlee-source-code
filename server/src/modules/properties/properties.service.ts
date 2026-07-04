/**
 * Properties Service
 * Business logic for the listing lifecycle:
 *   pending → approved → (sold/rented or expired)
 *           ↘ rejected → (edit & resubmit) → pending
 */
import { Types } from 'mongoose';
import { Property } from './property.model.js';
import { getNextSequence } from '../../shared/models/counter.model.js';
import { User } from '../users/user.model.js';
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
  CreatePropertyInput,
  UpdatePropertyInput,
  PropertyListQuery,
} from './properties.validators.js';
import {
  resolveSearchTerms,
  buildTextSearchClause,
  arabicTolerantPattern,
  expandToPatterns,
} from './searchHelpers.js';

/**
 * Build a Mongoose filter from the public list-query params.
 * Used by both the public listing endpoint and the admin listing endpoint.
 */
function buildPublicFilter(query: PropertyListQuery) {
  const filter: Record<string, unknown> = { status: 'approved' };
  const andClauses: Record<string, unknown>[] = [];

  if (query.type) filter.type = query.type;
  if (query.listingType) filter.listingType = query.listingType;
  if (query.category) filter.category = query.category;
  if (query.governorate) {
    // Governorate from filters: exact match against the stored Arabic name.
    filter.governorate = query.governorate;
  }
  if (query.finishing) filter.finishing = query.finishing;
  if (query.minBedrooms !== undefined) filter.bedrooms = { $gte: query.minBedrooms };
  if (query.minArea !== undefined) filter.area = { $gte: query.minArea };
  if (query.featured) filter.isFeatured = true;

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
    if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
    filter.price = priceFilter;
  }

  // Smart free-text search:
  //   1. Parse Arabic/English synonyms into structured filters (type/listingType/...)
  //   2. Whatever is left becomes a fuzzy regex over description/area/governorate.
  if (query.search && query.search.trim()) {
    const resolved = resolveSearchTerms(query.search);

    // Apply implied enum filters — but only when the user hasn't pinned them via explicit filter
    if (resolved.types.length && !query.type) {
      andClauses.push({ type: { $in: resolved.types } });
    }
    if (resolved.listingTypes.length && !query.listingType) {
      andClauses.push({ listingType: { $in: resolved.listingTypes } });
    }
    if (resolved.categories.length && !query.category) {
      andClauses.push({ category: { $in: resolved.categories } });
    }
    if (resolved.finishings.length && !query.finishing) {
      andClauses.push({ finishing: { $in: resolved.finishings } });
    }

    // Free-text regex over description / area_name / governorate
    const textClause = buildTextSearchClause(resolved.freeText);
    if (textClause) {
      andClauses.push(textClause);
    } else if (
      !resolved.types.length &&
      !resolved.listingTypes.length &&
      !resolved.categories.length &&
      !resolved.finishings.length
    ) {
      // Nothing parsed and no leftover text — fall back to an Arabic-tolerant regex over the raw input
      const pattern = arabicTolerantPattern(query.search.trim());
      andClauses.push({
        $or: [
          { description: { $regex: pattern, $options: 'i' } },
          { area_name: { $regex: pattern, $options: 'i' } },
          { governorate: { $regex: pattern, $options: 'i' } },
        ],
      });
    }
  }

  if (andClauses.length) {
    filter.$and = andClauses;
  }

  return filter;
}

function buildSort(sort: PropertyListQuery['sort']): Record<string, 1 | -1> {
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

export async function listProperties(query: PropertyListQuery) {
  const filter = buildPublicFilter(query);
  const sort = buildSort(query.sort);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, query.page, query.limit),
  };
}

/**
 * Lightweight suggestions for the search autocomplete.
 *
 * Returns up to 5 area-name matches and up to 3 governorate matches —
 * each item carries a label, a category and the query string that would
 * filter the listings page to those results.
 */
export async function getSearchSuggestions(rawQuery: string) {
  const q = rawQuery.trim();
  if (q.length < 1) {
    return { items: [], properties: [] };
  }

  // Expand to bilingual location variants so "Maadi" surfaces "المعادي" areas.
  const regex = new RegExp(expandToPatterns(q).join('|'), 'i');

  const baseFilter = { status: 'approved' as const };

  // Run distinct queries in parallel
  const [areaMatches, govMatches, sampleProps] = await Promise.all([
    Property.distinct('area_name', { ...baseFilter, area_name: regex }),
    Property.distinct('governorate', { ...baseFilter, governorate: regex }),
    Property.find({
      ...baseFilter,
      $or: [
        { area_name: regex },
        { governorate: regex },
        { description: regex },
      ],
    })
      .select('_id area_name governorate type listingType price images')
      .limit(4)
      .lean(),
  ]);

  interface Suggestion {
    label: string;
    sublabel?: string;
    kind: 'area' | 'governorate';
    href: string;
  }

  const items: Suggestion[] = [];

  for (const name of areaMatches.slice(0, 5)) {
    items.push({
      label: name,
      kind: 'area',
      href: `/properties?search=${encodeURIComponent(name)}`,
    });
  }

  for (const gov of govMatches.slice(0, 3)) {
    items.push({
      label: gov,
      sublabel: 'محافظة',
      kind: 'governorate',
      href: `/properties?governorate=${encodeURIComponent(gov)}`,
    });
  }

  return {
    items,
    properties: sampleProps.map((p) => ({
      _id: p._id,
      label: p.area_name,
      sublabel: p.governorate,
      type: p.type,
      listingType: p.listingType,
      price: p.price,
      image: p.images?.[0]?.url ?? null,
    })),
  };
}

// Home sections rank by rating first so highly-rated listings rise to the top
// of the cards, with recency as the tie-breaker. Until a listing has any
// ratings its ratingAvg is 0, so on a fresh catalogue this still behaves like
// "newest first" and only re-orders as ratings come in.
const RATING_FIRST_SORT = { ratingAvg: -1, createdAt: -1 } as const;

export async function getFeatured(limit = 8) {
  return Property.find({ status: 'approved', isFeatured: true })
    .populate('owner', 'name avatar')
    .sort(RATING_FIRST_SORT)
    .limit(limit)
    .lean();
}

export async function getLatest(limit = 8) {
  return Property.find({ status: 'approved' })
    .populate('owner', 'name avatar')
    .sort(RATING_FIRST_SORT)
    .limit(limit)
    .lean();
}

export async function getPropertyById(id: string, viewerId?: string) {
  // Public endpoint — never expose the owner's email (PII). Contact happens
  // via the listing's whatsappNumber. Only name + avatar are needed.
  const property = await Property.findById(id).populate('owner', 'name avatar');
  if (!property) throw new NotFoundError('Property not found');

  // The owner ref can be null if the owner's account was deleted (orphaned listing).
  const ownerId = property.owner ? String(property.owner._id) : null;

  // Only the owner (or admin elsewhere) can see non-approved listings
  if (property.status !== 'approved') {
    if (!viewerId || ownerId !== viewerId) {
      throw new NotFoundError('Property not found');
    }
  }

  // Increment view count (fire-and-forget — don't await)
  if (property.status === 'approved' && (!viewerId || ownerId !== viewerId)) {
    Property.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).catch(() => {});
  }

  return property;
}

export async function getSimilarProperties(id: string, limit = 4) {
  const ref = await Property.findById(id).select('type governorate price status').lean();
  if (!ref || ref.status !== 'approved') return [];

  // Match on a price band only when the reference listing actually has a price.
  const priceFilter =
    ref.price != null ? { price: { $gte: ref.price * 0.7, $lte: ref.price * 1.3 } } : {};

  return Property.find({
    _id: { $ne: id },
    status: 'approved',
    type: ref.type,
    governorate: ref.governorate,
    ...priceFilter,
  })
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getPropertiesByOwner(ownerId: string, limit = 12) {
  return Property.find({ owner: ownerId, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Creates a new listing. Status is always 'pending' — admin must approve.
 * Computes expiresAt from durationDays.
 */
export async function createProperty(ownerId: string, input: CreatePropertyInput) {
  const expiresAt = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000);
  const seq = await getNextSequence('property');

  const property = await Property.create({
    seq,
    owner: new Types.ObjectId(ownerId),
    type: input.type,
    listingType: input.listingType,
    category: input.category,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    floor: input.type === 'apartment' ? input.floor : null,
    area: input.area,
    finishing: input.finishing,
    services: input.services ?? [],
    hasElevator: input.hasElevator ?? false,
    hasGarage: input.hasGarage ?? false,
    deposit: input.deposit ?? null,
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

  return property;
}

export async function getMyProperties(ownerId: string) {
  return Property.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
}

/**
 * Updates a listing. If it was rejected, resubmits it as pending.
 */
export async function updateProperty(
  ownerId: string,
  id: string,
  input: UpdatePropertyInput
) {
  const property = await Property.findById(id);
  if (!property) throw new NotFoundError('Property not found');
  if (String(property.owner) !== ownerId) {
    throw new ForbiddenError('You can only edit your own properties');
  }
  if (property.status === 'sold' || property.status === 'rented') {
    throw new BadRequestError('Cannot edit a property that is sold or rented');
  }

  const wasRejected = property.status === 'rejected';

  Object.assign(property, {
    ...(input.type !== undefined && { type: input.type }),
    ...(input.listingType !== undefined && { listingType: input.listingType }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
    ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
    ...(input.area !== undefined && { area: input.area }),
    ...(input.finishing !== undefined && { finishing: input.finishing }),
    ...(input.services !== undefined && { services: input.services }),
    ...(input.hasElevator !== undefined && { hasElevator: input.hasElevator }),
    ...(input.hasGarage !== undefined && { hasGarage: input.hasGarage }),
    ...(input.deposit !== undefined && { deposit: input.deposit }),
    ...(input.price !== undefined && { price: input.price }),
    ...(input.governorate !== undefined && { governorate: input.governorate }),
    ...(input.area_name !== undefined && { area_name: input.area_name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.images !== undefined && { images: input.images }),
    ...(input.whatsappNumber !== undefined && { whatsappNumber: input.whatsappNumber }),
  });

  // Floor only applies to apartments
  const finalType = input.type ?? property.type;
  if (finalType === 'apartment' && input.floor !== undefined) {
    property.floor = input.floor;
  } else if (finalType !== 'apartment') {
    property.floor = null;
  }

  if (input.coordinates) {
    property.location = { type: 'Point', coordinates: input.coordinates };
  }

  if (input.durationDays) {
    property.durationDays = input.durationDays;
    property.expiresAt = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000);
  }

  // Resubmit for review if previously rejected
  if (wasRejected) {
    property.status = 'pending';
    property.rejectionReason = null;
  }

  await property.save();
  return property;
}

/**
 * Soft-removes a listing by deleting it and its Cloudinary images.
 */
export async function deleteProperty(ownerId: string, id: string) {
  const property = await Property.findById(id);
  if (!property) throw new NotFoundError('Property not found');
  if (String(property.owner) !== ownerId) {
    throw new ForbiddenError('You can only delete your own properties');
  }

  // Best-effort cleanup of cloudinary images
  await Promise.all(
    property.images.map((img) =>
      cloudinary.uploader.destroy(img.publicId).catch((err) => {
        console.error('[cloudinary] failed to delete', img.publicId, err);
      })
    )
  );

  await property.deleteOne();
}

/**
 * Admin removes any listing (no owner check) and cleans up its Cloudinary
 * images. Used by the admin panel's delete action.
 */
export async function adminDeleteProperty(id: string) {
  const property = await Property.findById(id);
  if (!property) throw new NotFoundError('Property not found');

  // Best-effort cleanup of cloudinary images
  await Promise.all(
    property.images.map((img) =>
      cloudinary.uploader.destroy(img.publicId).catch((err) => {
        console.error('[cloudinary] failed to delete', img.publicId, err);
      })
    )
  );

  await property.deleteOne();
}

/**
 * Admin removes many listings at once (no owner check) and cleans up their
 * Cloudinary images. Used by the admin panel's bulk-delete action.
 * Returns how many listings were actually deleted.
 */
export async function adminBulkDeleteProperties(ids: string[]): Promise<{ deletedCount: number }> {
  const properties = await Property.find({ _id: { $in: ids } });
  if (properties.length === 0) return { deletedCount: 0 };

  // Best-effort cleanup of every selected listing's Cloudinary images.
  await Promise.all(
    properties.flatMap((property) =>
      property.images.map((img) =>
        cloudinary.uploader.destroy(img.publicId).catch((err) => {
          console.error('[cloudinary] failed to delete', img.publicId, err);
        })
      )
    )
  );

  const result = await Property.deleteMany({ _id: { $in: properties.map((p) => p._id) } });
  return { deletedCount: result.deletedCount ?? 0 };
}

/**
 * Owner marks their listing as sold or rented — it disappears from search.
 */
export async function markAsSoldOrRented(
  ownerId: string,
  id: string,
  status: 'sold' | 'rented'
) {
  const property = await Property.findById(id).populate('owner', 'name email');
  if (!property) throw new NotFoundError('Property not found');
  if (String(property.owner._id) !== ownerId) {
    throw new ForbiddenError('Only the owner can update this');
  }
  if (property.status !== 'approved') {
    throw new BadRequestError('Only approved properties can be marked as sold/rented');
  }

  property.status = status;
  await property.save();

  // Send thank-you email — fire-and-forget (don't block the response on SMTP).
  const owner = property.owner as unknown as { email: string; name: string };
  void sendEmail({
    to: owner.email,
    subject: 'شكراً لك من بيت لي 🏡',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>مبروك على إتمام الصفقة!</h2>
        <p>عزيزي ${owner.name},</p>
        <p>نشكرك على استخدامك منصة بيت لي. تم تحديث حالة عقارك إلى ${status === 'sold' ? 'مُباع' : 'مؤجر'} بنجاح.</p>
        <p>نتمنى لك التوفيق ونتطلع لخدمتك مرة أخرى.</p>
        <p style="margin-top:20px;color:#666;">— فريق بيت لي</p>
      </div>
    `,
  });

  return property;
}

/**
 * Admin approves or rejects a property.
 * Triggers notification + email.
 */
export async function reviewProperty(
  propertyId: string,
  decision: 'approved' | 'rejected',
  rejectionReason?: string
) {
  const property = await Property.findById(propertyId).populate('owner', 'name email');
  if (!property) throw new NotFoundError('Property not found');
  if (property.status !== 'pending') {
    throw new BadRequestError('Only pending properties can be reviewed');
  }

  property.status = decision;
  property.rejectionReason = decision === 'rejected' ? (rejectionReason ?? null) : null;
  await property.save();

  const owner = property.owner as unknown as { _id: unknown; email: string; name: string };

  // In-app notification
  await createNotification({
    userId: String(owner._id),
    type: decision === 'approved' ? 'listing_approved' : 'listing_rejected',
    title: decision === 'approved' ? 'تم قبول إعلانك' : 'تم رفض إعلانك',
    message:
      decision === 'approved'
        ? `تم قبول إعلانك "${property.area_name}" وأصبح متاحاً على المنصة.`
        : `تم رفض إعلانك "${property.area_name}". السبب: ${rejectionReason}`,
    link: `/properties/${property._id}`,
  });

  // Email — fire-and-forget so a slow/unreachable SMTP never blocks the admin's
  // approve/reject response. (The panel used to hang until the SMTP timeout, so
  // the action only appeared to work after a manual refresh.) sendEmail catches
  // and logs its own errors.
  void sendEmail({
    to: owner.email,
    subject: decision === 'approved' ? 'تم قبول إعلانك في بيت لي ✅' : 'تم رفض إعلانك في بيت لي',
    html:
      decision === 'approved'
        ? `<div dir="rtl"><h2>مبروك! تم قبول إعلانك</h2><p>عزيزي ${owner.name}, تم قبول إعلانك وأصبح ظاهراً للمستخدمين الآن.</p></div>`
        : `<div dir="rtl"><h2>تم رفض إعلانك</h2><p>عزيزي ${owner.name},</p><p><strong>السبب:</strong> ${rejectionReason}</p><p>يمكنك تعديل الإعلان وإعادة تقديمه من لوحة التحكم الخاصة بك.</p></div>`,
  });

  return property;
}

export async function setFeatured(propertyId: string, isFeatured: boolean) {
  const property = await Property.findByIdAndUpdate(
    propertyId,
    { isFeatured },
    { new: true }
  );
  if (!property) throw new NotFoundError('Property not found');
  return property;
}

/**
 * Admin list — includes non-approved properties.
 */
export async function adminListProperties(query: PropertyListQuery & { status?: string }) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  if (query.listingType) filter.listingType = query.listingType;

  const sort = buildSort(query.sort);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Property.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildPaginationMeta(total, query.page, query.limit),
  };
}
