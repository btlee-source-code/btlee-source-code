import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localizedPageMetadata } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'disclaimer' });
  return localizedPageMetadata({
    locale,
    path: '/disclaimer',
    title: t('title'),
    description: t('intro'),
  });
}

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
