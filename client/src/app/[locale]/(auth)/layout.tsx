/**
 * Auth layout — wraps the auth forms with the full site Navbar + Footer.
 * The page-level Card carries its own brand mark + heading.
 */
import { Navbar } from '@/shared/components/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-secondary/30 px-4 py-12 md:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
