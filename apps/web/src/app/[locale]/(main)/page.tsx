/**
 * Home Page — composes all marketing sections in their intended order.
 */
import type { Metadata } from 'next';
import { HeroSection } from '@/features/home/components/HeroSection';
import { StatsSection } from '@/features/home/components/StatsSection';
import { CategoriesSection } from '@/features/home/components/CategoriesSection';
import { FeaturedProperties } from '@/features/home/components/FeaturedProperties';
import { LatestProperties } from '@/features/home/components/LatestProperties';
import { WhyUsSection } from '@/features/home/components/WhyUsSection';
import { CtaSection } from '@/features/home/components/CtaSection';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import {
  SITE_URL,
  SITE_NAME,
  SITE_NAME_EN,
  OG_IMAGE,
  SITE_SOCIALS,
  localizedSiteInfo,
  localizedAlternates,
} from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = localizedSiteInfo(locale);
  const url = `/${site.locale}`;

  return {
    title: { absolute: site.homeTitle },
    description: site.description,
    alternates: localizedAlternates(site.locale),
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: site.homeTitle,
      description: site.description,
      url,
      locale: site.openGraphLocale,
      alternateLocale: site.alternateOpenGraphLocale,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.homeTitle,
      description: site.description,
      images: [OG_IMAGE],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const site = localizedSiteInfo(locale);
  const localizedUrl = `${SITE_URL}/${site.locale}`;

  const structuredData: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: site.name,
      url: localizedUrl,
      logo: `${SITE_URL}/favicon.png`,
      description: site.description,
      inLanguage: site.locale,
      sameAs: SITE_SOCIALS,
    },
  ];

  // Google supports one site name for the whole domain (not one per language
  // subdirectory). The Arabic homepage is our x-default landing page, so it is
  // the single source of the WebSite name, with the English brand supplied as
  // an alternative rather than mixing both names into visible page titles.
  if (site.locale === 'ar') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: SITE_NAME_EN,
      url: SITE_URL,
      inLanguage: ['ar', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/ar/properties?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <HeroSection />
      <StatsSection />
      <FeaturedProperties />
      <CategoriesSection />
      <LatestProperties />
      <WhyUsSection />
      <CtaSection />
    </>
  );
}
