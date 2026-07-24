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
import { serverApiBase, SITE_URL } from '@/config/site';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PropertyDetailView } from '@/features/properties/detail/components/PropertyDetailView';
import type { Property } from '@/shared/types/property';

interface PageParams {
  params: Promise<{ locale: string; id: string }>;
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
  const inWord = locale === 'ar' ? 'في' : 'in';
  const title = `${t(`types.${property.type}`)} ${t(`listingTypes.${property.listingType}`)} ${inWord} ${property.area_name}، ${property.governorate}`;
  const description =
    property.description?.trim().slice(0, 160) || title;
  const image = property.images?.[0]?.url;
  const url = `/${locale}/properties/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `/ar/properties/${id}`, en: `/en/properties/${id}` },
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: image ? [{ url: image, alt: property.area_name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
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
  const name = `${t(`types.${property.type}`)} ${t(`listingTypes.${property.listingType}`)} ${inWord} ${property.area_name}، ${property.governorate}`;
  const url = `${SITE_URL}/${locale}/properties/${id}`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name,
    description: property.description,
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
    ...((property.ratingCount ?? 0) > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: property.ratingAvg,
            ratingCount: property.ratingCount,
            bestRating: 5,
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
