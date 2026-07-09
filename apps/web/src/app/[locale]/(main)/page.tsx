/**
 * Home Page — composes all marketing sections in their intended order.
 */
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
  SITE_DESCRIPTION,
  SITE_SOCIALS,
} from '@/config/site';

export default function HomePage() {
  return (
    <>
      {/* Organization + WebSite structured data (with a sitelinks search box) */}
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME_EN,
            alternateName: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/favicon.png`,
            description: SITE_DESCRIPTION,
            sameAs: SITE_SOCIALS,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME_EN,
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
          },
        ]}
      />
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
