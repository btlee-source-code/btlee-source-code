/**
 * Property Detail Page (Server Component)
 *
 * Fetches the listing on the SERVER so its content is in the initial HTML for
 * crawlers, builds per-listing SEO metadata (title/description/Open Graph) and
 * RealEstateListing structured data, then hands the data to the interactive
 * client view.
 */
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  localizedAlternates,
  localizedSiteInfo,
  serverApiBase,
  SITE_URL,
} from '@/config/site';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PropertyDetailView } from '@/features/properties/detail/components/PropertyDetailView';
import type { Property } from '@/shared/types/property';

interface PageParams {
  params: Promise<{ locale: string; id: string }>;
}

const GOVERNORATE_NAMES_EN: Record<string, string> = {
  'القاهرة': 'Cairo',
  'الجيزة': 'Giza',
  'الإسكندرية': 'Alexandria',
  'الدقهلية': 'Dakahlia',
  'البحر الأحمر': 'Red Sea',
  'البحيرة': 'Beheira',
  'الفيوم': 'Fayoum',
  'الغربية': 'Gharbia',
  'الإسماعيلية': 'Ismailia',
  'المنوفية': 'Monufia',
  'المنيا': 'Minya',
  'القليوبية': 'Qalyubia',
  'الوادي الجديد': 'New Valley',
  'السويس': 'Suez',
  'أسوان': 'Aswan',
  'أسيوط': 'Assiut',
  'بني سويف': 'Beni Suef',
  'بورسعيد': 'Port Said',
  'دمياط': 'Damietta',
  'الشرقية': 'Sharqia',
  'جنوب سيناء': 'South Sinai',
  'كفر الشيخ': 'Kafr El Sheikh',
  'مطروح': 'Matrouh',
  'الأقصر': 'Luxor',
  'قنا': 'Qena',
  'شمال سيناء': 'North Sinai',
  'سوهاج': 'Sohag',
};

function matchesPageLanguage(text: string, locale: string): boolean {
  const arabicCharacters = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latinCharacters = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (arabicCharacters === latinCharacters) return true;
  return locale === 'ar'
    ? arabicCharacters > latinCharacters
    : latinCharacters > arabicCharacters;
}

function localizedListingLocation(property: Property, locale: string): string {
  const area = property.area_name.trim();

  if (locale === 'ar') {
    return matchesPageLanguage(area, locale)
      ? `${area}، ${property.governorate}`
      : property.governorate;
  }

  const governorate = GOVERNORATE_NAMES_EN[property.governorate] ?? 'Egypt';
  return matchesPageLanguage(area, locale) ? `${area}, ${governorate}` : governorate;
}

// Fetch a single property on the server. Next memoizes identical fetches within
// a request, so generateMetadata + the page share one network call.
async function getProperty(id: string): Promise<Property | null> {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  try {
    // The public detail endpoint also allows the listing owner to preview
    // pending/rejected/expired listings. Server Components do not forward the
    // browser's cookies automatically, so pass only the user access cookie.
    // Authenticated responses must never enter the shared Next.js cache.
    const accessToken = (await cookies()).get('access_token')?.value;
    const res = await fetch(`${serverApiBase()}/properties/${id}`, {
      ...(accessToken
        ? {
            headers: { Cookie: `access_token=${accessToken}` },
            cache: 'no-store' as const,
          }
        : { next: { revalidate: 300 } }),
    });
    if (!res.ok) return null;
    const json: { data?: Property } = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: locale === 'ar' ? 'العقار غير موجود' : 'Property not found' };

  const t = await getTranslations({ locale, namespace: 'property' });
  const site = localizedSiteInfo(locale);
  const inWord = locale === 'ar' ? 'في' : 'in';
  const location = localizedListingLocation(property, locale);
  const title = `${t(`types.${property.type}`)} ${t(`listingTypes.${property.listingType}`)} ${inWord} ${location}`;
  const rawDescription = property.description?.trim();
  const description = rawDescription && matchesPageLanguage(rawDescription, locale)
    ? rawDescription.slice(0, 160)
    : locale === 'ar'
      ? `${title}. شاهد الصور والتفاصيل وتواصل مباشرة مع المعلن على بيت لي.`
      : `${title}. View photos and listing details, then contact the advertiser directly on Btlee.`;
  const image = property.images?.[0]?.url;
  const url = `/${locale}/properties/${id}`;
  const brandedTitle = `${title} | ${site.name}`;

  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/properties/${id}`),
    openGraph: {
      type: 'article',
      siteName: site.name,
      title: brandedTitle,
      description,
      url,
      locale: site.openGraphLocale,
      alternateLocale: site.alternateOpenGraphLocale,
      images: image ? [{ url: image, alt: property.area_name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageParams) {
  const { locale, id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const t = await getTranslations({ locale, namespace: 'property' });
  const inWord = locale === 'ar' ? 'في' : 'in';
  const location = localizedListingLocation(property, locale);
  const name = `${t(`types.${property.type}`)} ${t(`listingTypes.${property.listingType}`)} ${inWord} ${location}`;
  const rawDescription = property.description?.trim();
  const description = rawDescription && matchesPageLanguage(rawDescription, locale)
    ? rawDescription
    : name;
  const url = `${SITE_URL}/${locale}/properties/${id}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name,
    description,
    url,
    image: property.images?.map((img) => img.url),
    datePosted: property.createdAt,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.area_name,
      addressRegion: property.governorate,
      addressCountry: 'EG',
    },
    ...(property.price != null
      ? {
          offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: 'EGP',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PropertyDetailView property={property} />
    </>
  );
}
