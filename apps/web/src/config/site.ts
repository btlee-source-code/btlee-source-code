/**
 * Central site constants used for SEO (metadata, sitemap, robots, structured
 * data). The canonical origin comes from NEXT_PUBLIC_SITE_URL — set it to the
 * real production domain (e.g. https://btlee.com). Falls back to localhost in
 * development so links still resolve.
 */
import type { Metadata } from 'next';
import ogLogo from '@btlee/shared/logos/btlee-properties-logo.png';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export const SITE_NAME = 'بيت لي';
export const SITE_NAME_EN = 'Btlee';

export const SITE_HOME_TITLE = 'بيت لي | منصة عقارات بدون وسيط وبدون عمولة في مصر';
export const SITE_HOME_TITLE_EN = SITE_NAME_EN;

export const SITE_DESCRIPTION =
  'منصة عقارية تربطك بصاحب العقار مباشرة بدون وسطاء — شقق وفيلات ومحلات للبيع والإيجار في مصر.';
export const SITE_DESCRIPTION_EN =
  'A real-estate platform that connects you directly with property owners — apartments, villas and shops for sale and rent in Egypt, with no middleman.';

/** Language-specific branding used by page metadata. Keeping every field in
 * the page language prevents Google from having to rewrite mixed-script title
 * links (for example, "بيت لي — Btlee"). */
export function localizedSiteInfo(locale: string) {
  const isArabic = locale === 'ar';

  return {
    locale: isArabic ? 'ar' : 'en',
    name: isArabic ? SITE_NAME : SITE_NAME_EN,
    homeTitle: isArabic ? SITE_HOME_TITLE : SITE_HOME_TITLE_EN,
    description: isArabic ? SITE_DESCRIPTION : SITE_DESCRIPTION_EN,
    openGraphLocale: isArabic ? 'ar_EG' : 'en_US',
    alternateOpenGraphLocale: isArabic ? 'en_US' : 'ar_EG',
  } as const;
}

/** Default social-share image — bundled from the shared logo package; Next
 * serves it at a hashed /_next/static path, resolved absolute via metadataBase. */
export const OG_IMAGE = ogLogo.src;

/** Optional social links used in Organization structured data. */
export const SITE_SOCIALS = ['https://www.facebook.com/share/1CuGDB45iY/'];

/**
 * Canonical and hreflang links for a public localized route.
 *
 * Keep this route-specific instead of defining it in the locale root layout;
 * otherwise every child page would incorrectly claim the locale homepage as
 * its canonical URL.
 */
export function localizedAlternates(locale: string, path = '') {
  const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path;

  return {
    canonical: `/${locale}${normalizedPath}`,
    languages: {
      ar: `/ar${normalizedPath}`,
      en: `/en${normalizedPath}`,
      'x-default': `/ar${normalizedPath}`,
    },
  };
}

/** Complete metadata for a localized public page. Besides the HTML title and
 * description, this deliberately overrides inherited Open Graph/Twitter fields
 * so a child page never falls back to the homepage title in search/share data. */
export function localizedPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const site = localizedSiteInfo(locale);
  const brandedTitle = `${title} | ${site.name}`;

  return {
    title,
    description,
    alternates: localizedAlternates(site.locale, path),
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: brandedTitle,
      description,
      url: `/${site.locale}${path}`,
      locale: site.openGraphLocale,
      alternateLocale: site.alternateOpenGraphLocale,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}

/**
 * Absolute API base for SERVER-side fetches (sitemap, server-rendered pages).
 * The browser uses a relative `/api` (proxied) but the server needs an absolute
 * origin: prefer API_PROXY_TARGET (the real backend), then an absolute
 * NEXT_PUBLIC_API_URL, else localhost in dev.
 */
export function serverApiBase(): string {
  const proxy = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
  if (proxy) return `${proxy}/api`;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && /^https?:\/\//.test(pub)) return pub.replace(/\/$/, '');
  return 'http://localhost:5000/api';
}
