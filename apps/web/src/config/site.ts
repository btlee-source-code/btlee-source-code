/**
 * Central site constants used for SEO (metadata, sitemap, robots, structured
 * data). The canonical origin comes from NEXT_PUBLIC_SITE_URL — set it to the
 * real production domain (e.g. https://btlee.com). Falls back to localhost in
 * development so links still resolve.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export const SITE_NAME = 'بيت لي';
export const SITE_NAME_EN = 'Btlee';

export const SITE_DESCRIPTION =
  'منصة عقارية تربطك بصاحب العقار مباشرة بدون وسطاء — شقق وفيلات ومحلات للبيع والإيجار في مصر.';
export const SITE_DESCRIPTION_EN =
  'A real-estate platform that connects you directly with property owners — apartments, villas and shops for sale and rent in Egypt, with no middleman.';

/** Default social-share image (file lives at /public/btlee-logo.png). */
export const OG_IMAGE = '/btlee-logo.png';

/** Optional social links used in Organization structured data. */
export const SITE_SOCIALS = ['https://www.facebook.com/share/1CuGDB45iY/'];

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
