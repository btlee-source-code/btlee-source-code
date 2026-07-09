import type { MetadataRoute } from 'next';
import { SITE_URL, serverApiBase } from '@/config/site';

const LOCALES = ['ar', 'en'] as const;

// Public static routes (per locale). Account/admin pages are intentionally left
// out — they're disallowed in robots.ts. Auth pages (login/register) are also
// excluded: they carry no SEO value and Google flags them as thin duplicates.
const STATIC_PATHS = ['', '/properties', '/disclaimer'];

function altLanguages(path: string) {
  return {
    ar: `${SITE_URL}/ar${path}`,
    en: `${SITE_URL}/en${path}`,
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

  // Dynamic: approved property pages. Best-effort — a sitemap must never crash
  // the build, so any API failure just yields the static routes above.
  try {
    const res = await fetch(`${serverApiBase()}/properties?limit=1000&sort=newest`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json: { data?: Array<{ _id: string; updatedAt?: string }> } = await res.json();

      for (const p of json.data ?? []) {
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
    }
  } catch {
    // ignore — return static routes only
  }

  return entries;
}
