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
      path: '/login',
      title: t('loginSeoTitle'),
      description: t('loginSeoDescription'),
    }),
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
