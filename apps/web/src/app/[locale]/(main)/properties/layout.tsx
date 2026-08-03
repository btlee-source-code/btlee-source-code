import type { Metadata } from 'next';
import { localizedAlternates } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localizedAlternates(locale, '/properties') };
}

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
