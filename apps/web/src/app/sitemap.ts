import type { MetadataRoute } from 'next';
import { SITE_URL, serverApiBase } from '@/config/site';

const LOCALES = ['ar', 'en'] as const;

// Public static routes (per locale). Account/admin pages are intentionally left
// out. Login and registration are public discovery pages; password recovery and
// OAuth callback routes remain noindex and are intentionally omitted.
const STATIC_PATHS = [
  '',
  '/properties',
  '/login',
  '/register',
  '/privacy',
  '/disclaimer',
  '/data-deletion',
];

const PROPERTY_PAGE_SIZE = 100;

function altLanguages(path: string) {
  return {
    ar: `${SITE_URL}/ar${path}`,
    en: `${SITE_URL}/en${path}`,
    'x-default': `${SITE_URL}/ar${path}`,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1 : 0.7,
        alternates: { languages: altLanguages(path) },
      });
    }
  }

  // Dynamic: approved property pages. The API caps `limit` at 100, so fetch all
  // pages instead of asking for an invalid oversized response. A failure keeps
  // the static sitemap available, but is logged so it cannot go unnoticed.
  try {
    const properties = new Map<string, { _id: string; updatedAt?: string }>();
    let page = 1;
    let totalPages = 1;

    do {
      const res = await fetch(
        `${serverApiBase()}/properties?page=${page}&limit=${PROPERTY_PAGE_SIZE}&sort=newest`,
        { next: { revalidate: 3600 } },
      );

      if (!res.ok) {
        throw new Error(`Properties API returned ${res.status} for sitemap page ${page}`);
      }

      const json: {
        data?: Array<{ _id: string; updatedAt?: string }>;
        meta?: { pagination?: { totalPages?: number } };
      } = await res.json();

      const batch = json.data ?? [];
      for (const property of batch) properties.set(property._id, property);

      const reportedTotalPages = json.meta?.pagination?.totalPages;
      totalPages =
        typeof reportedTotalPages === 'number' && Number.isFinite(reportedTotalPages)
          ? Math.max(1, Math.floor(reportedTotalPages))
          : batch.length === PROPERTY_PAGE_SIZE
            ? page + 1
            : page;
      page += 1;
    } while (page <= totalPages);

    for (const p of properties.values()) {
      const path = `/properties/${p._id}`;

      for (const locale of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${locale}${path}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: { languages: altLanguages(path) },
        });
      }
    }
  } catch (error) {
    console.error('[sitemap] Failed to load approved property URLs:', error);
  }

  return entries;
}
