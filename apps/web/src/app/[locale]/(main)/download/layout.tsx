import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localizedPageMetadata } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'download.meta' });

  return localizedPageMetadata({
    locale,
    path: '/download',
    title: t('title'),
    description: t('description'),
  });
}

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
