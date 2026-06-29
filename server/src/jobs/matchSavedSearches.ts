/**
 * Saved Searches Match Job
 * Runs every 30 minutes. For each saved search, finds properties approved
 * since the last notification time that match the criteria, and sends a
 * notification + email to the user.
 */
import { Property } from '../modules/properties/property.model.js';
import { SavedSearch } from '../modules/saved-searches/savedSearch.model.js';
import { User } from '../modules/users/user.model.js';
import { createNotification } from '../modules/notifications/notifications.service.js';
import { sendEmail } from '../shared/utils/email.js';

async function matchOne(search: {
  _id: unknown;
  user: unknown;
  name: string;
  search: string | null;
  type: string | null;
  listingType: string | null;
  category: string | null;
  governorate: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  minArea: number | null;
  lastNotifiedAt: Date;
}) {
  const filter: Record<string, unknown> = {
    status: 'approved',
    createdAt: { $gt: search.lastNotifiedAt },
  };
  if (search.type) filter.type = search.type;
  if (search.listingType) filter.listingType = search.listingType;
  if (search.category) filter.category = search.category;
  if (search.governorate) filter.governorate = search.governorate;
  if (search.minBedrooms !== null) filter.bedrooms = { $gte: search.minBedrooms };
  if (search.minArea !== null) filter.area = { $gte: search.minArea };

  if (search.minPrice !== null || search.maxPrice !== null) {
    const p: Record<string, number> = {};
    if (search.minPrice !== null) p.$gte = search.minPrice;
    if (search.maxPrice !== null) p.$lte = search.maxPrice;
    filter.price = p;
  }

  if (search.search) filter.$text = { $search: search.search };

  const matches = await Property.find(filter).limit(10).lean();
  if (matches.length === 0) return;

  const userId = String(search.user);
  const user = await User.findById(userId).select('name email');
  if (!user) return;

  await createNotification({
    userId,
    type: 'saved_search_match',
    title: `${matches.length} عقار جديد يطابق بحثك المحفوظ`,
    message: `بحث "${search.name}" — ${matches.length} نتيجة جديدة`,
    link: '/saved-searches',
  });

  // Email only if the user signed up with one (phone-only users still get the
  // in-app notification above).
  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: `عقارات جديدة تطابق بحثك المحفوظ — بيت لي`,
      html: `<div dir="rtl"><h2>${matches.length} عقار جديد يطابق بحثك "${search.name}"</h2><p>ادخل للمنصة لاستعراض النتائج.</p></div>`,
    });
  }

  await SavedSearch.updateOne({ _id: search._id }, { lastNotifiedAt: new Date() });
}

export async function matchSavedSearchesTick(): Promise<void> {
  const searches = await SavedSearch.find({}).lean();
  for (const s of searches) {
    try {
      await matchOne(s as never);
    } catch (err) {
      console.error('[jobs] matchSavedSearch failed for', s._id, err);
    }
  }
}

let interval: NodeJS.Timeout | null = null;

export function startMatchSavedSearchesJob(): void {
  interval = setInterval(() => {
    matchSavedSearchesTick().catch((err) =>
      console.error('[jobs] matchSavedSearches failed', err)
    );
  }, 30 * 60 * 1000); // every 30 minutes
}

export function stopMatchSavedSearchesJob(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
