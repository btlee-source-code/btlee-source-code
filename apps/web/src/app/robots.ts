import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

/**
 * /robots.txt — allow public pages, keep private/account/admin areas out of the
 * index, and point crawlers at the sitemap. Locale-prefixed paths are matched
 * with a leading wildcard (e.g. /ar/admin, /en/admin).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/*/admin',
        '/*/profile',
        '/*/my-properties',
        '/*/wishlist',
        '/*/saved-searches',
        '/*/add-property',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
