'use client';
/**
 * One app mockup (see mockups.ts). Always the mockups' own aspect box, so a
 * layout holds its shape whether or not the image has loaded yet.
 *
 * Plain <img>, not next/image: the mockups are exported at their final size,
 * so the optimizer would only spend Vercel image quota.
 */
import { useLocale } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { MOCKUPS, MOCKUP_ASPECT, type ScreenName } from './mockups';

export function Mockup({
  screen,
  className,
  eager = false,
  tone = 'light',
}: {
  screen: ScreenName;
  className?: string;
  /** Above-the-fold mockups load immediately; the rest wait until near view. */
  eager?: boolean;
  /** Placeholder contrast — 'dark' for mockups sitting on a dark band. */
  tone?: 'light' | 'dark';
}) {
  const locale = useLocale() === 'ar' ? 'ar' : 'en';
  const src = MOCKUPS[locale][screen];

  return (
    <div className={cn('relative', className)} style={{ aspectRatio: MOCKUP_ASPECT }}>
      {/* Marks the spot until the Photoshop mockup is filled in (mockups.ts). */}
      {!src && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-[2.25rem] border-2 border-dashed p-4',
            tone === 'dark'
              ? 'border-white/20 bg-white/[0.03] text-white/45'
              : 'border-foreground/15 bg-foreground/[0.03] text-foreground/40',
          )}
        >
          <span dir="ltr" className="text-center font-mono text-[0.65rem] leading-relaxed">
            mockups/{locale}/
            <br />
            {screen}
          </span>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={700}
        height={1340}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="relative size-full object-contain"
      />
    </div>
  );
}
