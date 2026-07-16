'use client';
/**
 * Btlee brand logo — renders the brand image (wordmark included).
 *
 * Artwork is the single source of truth in `@btlee/shared/logos` (shared with
 * the mobile app), so a logo edit there updates web + mobile together. Two
 * variants are swapped purely with CSS based on the active theme (the `.dark`
 * class on <html>), so there's no flash or JS state:
 *   - light/white mode → the default (dark-coloured) logo.
 *   - dark mode        → the light-green logo, which stays legible on the
 *                        warm near-black background.
 */
import Image from 'next/image';
import logoLight from '@btlee/shared/logos/btlee-logo.png';
import logoDark from '@btlee/shared/logos/btlee-logo-dark.png';
import { Link } from '@/config/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

// Control the logo by height only; width stays `auto` so it keeps the source
// image's aspect ratio (697×151). Setting both axes (height via class, width
// via `w-auto`) also avoids next/image's "width or height modified but not the
// other" warning caused by Tailwind's global `img { height: auto }` preflight.
//
// `md` (the navbar) scales fluidly with the viewport via clamp() — it shrinks on
// small phones (down to 24px tall) so it never collides with the action icons,
// and caps at 32px on larger screens.
const heightClass: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-6',
  md: 'h-[clamp(1.5rem,7vw,2rem)]',
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
      {/* Default logo — shown in light mode, hidden in dark. */}
      <Image
        src={logoLight}
        alt={t('appName')}
        width={697}
        height={151}
        priority
        className={cn('w-auto dark:hidden', heightClass[size])}
      />
      {/* Light-green logo — shown only in dark mode. The asset is normalised to
          the exact same canvas (697×151) and content placement as the default,
          so both render at pixel-identical size. */}
      <Image
        src={logoDark}
        alt={t('appName')}
        width={697}
        height={151}
        priority
        className={cn('hidden w-auto dark:block', heightClass[size])}
      />
    </Link>
  );
}
