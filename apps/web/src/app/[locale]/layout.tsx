/**
 * Root Layout (per-locale)
 * Sets html lang/dir based on locale, provides messages to next-intl,
 * wraps the app with all providers.
 */
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { routing } from '@/config/routing';
import {
  SITE_URL,
  OG_IMAGE,
  localizedSiteInfo,
} from '@/config/site';
import { THEME_COOKIE } from '@/shared/components/layout/ThemeToggle';
import { AuthHydrator } from '@/features/auth/components/AuthHydrator';
import { LocalePreferenceSync } from '@/features/i18n/components/LocalePreferenceSync';
import { ZodI18nSetup } from '@/shared/components/providers/ZodI18nSetup';
import { ReduxProvider } from '@/shared/components/providers/ReduxProvider';
import { Toaster } from '@/shared/components/ui/toaster';
import '../globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = localizedSiteInfo(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: site.homeTitle,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: site.homeTitle,
      description: site.description,
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
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    // Favicon served from public/favicon.ico, referenced explicitly so it is the
    // single source (no competing app/icon.* file-convention icon).
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.png',
    },
    other: {
      // Tell the Dark Reader browser extension to leave the site alone — Btlee
      // ships its own light design and a manual dark mode for the admin panel.
      'darkreader-lock': 'true',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A3C34',
  // Light by default; users can switch to dark via the navbar toggle, so the
  // page advertises support for both schemes to native controls.
  colorScheme: 'light dark',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  // Read the saved theme from its cookie and render the `dark` class on <html>
  // server-side. This avoids both a flash of the wrong theme AND any client-side
  // <script> (which React 19 warns about when the layout re-renders on locale
  // switch). The navbar toggle keeps this cookie in sync.
  const isDark = (await cookies()).get(THEME_COOKIE)?.value === 'dark';

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={isDark ? 'dark' : undefined}
      suppressHydrationWarning
    >
      <head>

      </head>
      <body className="font-cairo min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <ZodI18nSetup />
            <AuthHydrator />
            <LocalePreferenceSync />
            {children}
            <Toaster />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
