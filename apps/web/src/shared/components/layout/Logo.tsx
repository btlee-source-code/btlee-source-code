'use client';
/**
 * Btlee brand logo — renders the brand wordmark.
 *
 * The single source of truth is the properties-section artwork in
 * `@btlee/shared/logos` (shared with the mobile app), so one edit updates web +
 * mobile together. One logo serves both light and dark themes (it reads on
 * either background), so there's no theme swap.
 */
import Image from 'next/image';
import logo from '@btlee/shared/logos/btlee-properties-logo.png';
import { Link } from '@/config/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

// Control the logo by height only; width stays `auto` so it keeps the source
// image's aspect ratio (489×259). Setting both axes (height via class, width
// via `w-auto`) also avoids next/image's "width or height modified but not the
// other" warning caused by Tailwind's global `img { height: auto }` preflight.
//
// `md` (the navbar) scales fluidly with the viewport via clamp() — it shrinks on
// small phones (down to 24px tall) so it never collides with the action icons,
// and caps at 32px on larger screens.
const heightClass: Record<NonNullable<LogoProps['size']>, string> = {
  // `sm` is used only in the admin panel (sidebar + topbar) — a touch larger so
  // the brand reads clearly there.
  sm: 'h-8',
  md: 'h-[clamp(1.75rem,8vw,2.5rem)]',
  lg: 'h-9 sm:h-10',
};

export function Logo({ size = 'md' }: LogoProps) {
  const t = useTranslations('common');

  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center transition-opacity hover:opacity-85"
      aria-label={t('appName')}
    >
      <Image
        src={logo}
        alt={t('appName')}
        width={489}
        height={259}
        priority
        className={cn('w-auto', heightClass[size])}
      />
    </Link>
  );
}
