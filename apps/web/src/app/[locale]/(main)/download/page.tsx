/**
 * /download — the Btlee Android app's own page: a hero with a fan of
 * handsets, a scroll-driven walkthrough of the app, the reasons to install
 * it, a screen gallery, a start guide and a closing call to action.
 * Metadata lives in layout.tsx.
 *
 * Sections are client components (they animate on scroll), composed here by a
 * server component so the page itself stays static.
 */
import { setRequestLocale } from 'next-intl/server';
import { MotionProvider } from '@/features/download/components/MotionProvider';
import { DownloadHero } from '@/features/download/components/DownloadHero';
import { Marquee } from '@/features/download/components/Marquee';
import { AppShowcase } from '@/features/download/components/AppShowcase';
import { FeatureList } from '@/features/download/components/FeatureList';
import { ScreenGallery } from '@/features/download/components/ScreenGallery';
import { StepsSection } from '@/features/download/components/StepsSection';
import { DownloadCta } from '@/features/download/components/DownloadCta';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { PLAY_STORE_URL, SITE_URL, localizedSiteInfo } from '@/config/site';

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const site = localizedSiteInfo(locale);

  // SoftwareApplication, without aggregateRating or downloads: Google requires
  // those to be real, and we have no verified Play Console figures to cite.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.name,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Android',
    url: `${SITE_URL}/${site.locale}/download`,
    downloadUrl: PLAY_STORE_URL,
    installUrl: PLAY_STORE_URL,
    inLanguage: ['ar', 'en'],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EGP' },
  };

  return (
    <MotionProvider>
      <JsonLd data={structuredData} />
      <DownloadHero />
      <Marquee />
      <AppShowcase />
      <FeatureList />
      <ScreenGallery />
      <StepsSection />
      <DownloadCta />
    </MotionProvider>
  );
}
