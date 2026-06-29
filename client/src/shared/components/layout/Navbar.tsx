'use client';
/**
 * Main navigation — sticky at the top.
 * Layout:
 *   [Logo] | Buy | Rent | Commercial | (spacer) | Add Property | 🔔 | ❤️ | [Avatar / Login] | AR/EN
 */
import { useState } from 'react';
import { Heart, Menu, X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/config/navigation';
import { Button } from '@/shared/components/ui/button';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/utils';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/properties?listingType=sale', label: t('buy'), match: 'sale' },
    { href: '/properties?listingType=rent', label: t('rent'), match: 'rent' },
    { href: '/properties?category=commercial', label: t('commercial'), match: 'commercial' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:gap-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as never}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground',
                  pathname?.includes(link.match)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 min-[380px]:gap-1.5 md:gap-2">
          <Button asChild variant="accent" size="sm" className="hidden md:inline-flex font-semibold">
            <Link href="/add-property">
              <Plus className="size-4" />
              {t('addProperty')}
            </Link>
          </Button>

          {isAuthenticated && (
            <>
              <NotificationsBell />
              <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Link href="/wishlist" aria-label={t('wishlist')}>
                  <Heart className="size-5" />
                </Link>
              </Button>
              <UserMenu />
            </>
          )}

          {!isAuthenticated && (
            <>
              <Button asChild variant="secondary" size="sm" className="hidden md:inline-flex border border-border">
                <Link href="/login">{t('login')}</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="hidden md:inline-flex">
                <Link href="/register">{t('register')}</Link>
              </Button>
            </>
          )}

          {/* Theme toggle — visible in the top bar on every screen size
              (not tucked inside the mobile menu). */}
          <ThemeToggle />

          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-9 min-[380px]:size-10 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="size-4 min-[380px]:size-5" />
            ) : (
              <Menu className="size-4 min-[380px]:size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto flex flex-col gap-2.5 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as never}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/add-property"
              className="rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t('addProperty')}
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  href="/register"
                  className="rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('register')}
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border-2 border-primary/40 bg-card px-3 py-2.5 text-center text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('login')}
                </Link>
              </>
            )}

            <div className="mt-1 border-t border-border pt-2">
              <LanguageSwitcher variant="inline" onSwitch={() => setMobileOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
