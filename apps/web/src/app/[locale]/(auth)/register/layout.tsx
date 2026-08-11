import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localizedPageMetadata } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return {
    ...localizedPageMetadata({
      locale,
      path: '/register',
      title: t('registerSeoTitle'),
      description: t('registerSeoDescription'),
    }),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
