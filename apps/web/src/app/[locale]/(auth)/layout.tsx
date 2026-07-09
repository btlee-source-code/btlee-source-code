/**
 * Auth layout — wraps the auth forms with the full site Navbar + Footer.
 * The page-level Card carries its own brand mark + heading.
 */
import type { Metadata } from 'next';
import { Navbar } from '@/shared/components/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';

// Auth pages (login/register/forgot/reset) carry no SEO value and look like
// thin duplicates across locales — keep them out of Google's index so they
// don't muddy the coverage report. They're also dropped from the sitemap.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-secondary/30 px-4 py-6 md:py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
