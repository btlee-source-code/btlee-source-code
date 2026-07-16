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
  SITE_NAME,
  SITE_NAME_EN,
  SITE_DESCRIPTION,
  SITE_DESCRIPTION_EN,
  OG_IMAGE,
} from '@/config/site';
import { THEME_COOKIE } from '@/shared/components/layout/ThemeToggle';
import { AuthHydrator } from '@/features/auth/components/AuthHydrator';
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
  const isAr = locale === 'ar';
  const description = isAr ? SITE_DESCRIPTION : SITE_DESCRIPTION_EN;
  const title = isAr ? `${SITE_NAME} — ${SITE_NAME_EN}` : `${SITE_NAME_EN} — ${SITE_NAME}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${isAr ? SITE_NAME : SITE_NAME_EN}`,
    },
    description,
    applicationName: SITE_NAME_EN,
    // hreflang + canonical so Google serves the right locale and doesn't treat
    // ar/en as duplicate content.
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: '/ar',
        en: '/en',
        'x-default': '/ar',
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME_EN,
      title,
      description,
      url: `/${locale}`,
      locale: isAr ? 'ar_EG' : 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    // Favicon served from public/favicon.png, referenced explicitly so it is the
    // single source (no competing app/icon.* file-convention icon).
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
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
            {children}
            <Toaster />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
