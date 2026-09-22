'use client';
/**
 * "GET IT ON Google Play" badge, drawn to match Google's official one: black
 * fill, thin grey keyline, Play mark and a two-line lockup. It stays English
 * and LTR in every locale, like Google's own badges.
 */
import { useTranslations } from 'next-intl';
import { PLAY_STORE_URL } from '@/config/site';
import { cn } from '@/shared/lib/utils';

export function PlayBadge({
  size = 'md',
  className,
}: {
  size?: 'md' | 'lg';
  className?: string;
}) {
  const t = useTranslations('download.hero');

  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('googlePlay')}
      dir="ltr"
      className={cn(
        'inline-flex items-center justify-center gap-3 rounded-xl border border-[#a6a6a6] bg-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]',
        size === 'lg' ? 'h-16 px-6' : 'h-14 px-5',
        className,
      )}
    >
      <GooglePlayGlyph className={size === 'lg' ? 'size-9 shrink-0' : 'size-8 shrink-0'} />
      <span className="flex flex-col items-start font-sans leading-none">
        <span className="text-[0.68rem] font-medium tracking-wider">GET IT ON</span>
        <span
          className={cn(
            'mt-1 font-medium tracking-[-0.01em]',
            size === 'lg' ? 'text-[1.6rem]' : 'text-[1.4rem]',
          )}
        >
          Google Play
        </span>
      </span>
    </a>
  );
}

/** Google Play mark — inlined so the badge needs no remote asset. */
export function GooglePlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="presentation">
      <path
        fill="#00D9FF"
        d="M3.6 1.8a1.5 1.5 0 0 0-.5 1.14v18.12c0 .46.19.87.5 1.14l.1.08L13.8 12.1v-.2L3.7 1.72l-.1.08Z"
      />
      <path
        fill="#FFCE00"
        d="m17.2 15.5-3.4-3.4v-.2l3.4-3.4.08.04 4.02 2.29c1.15.65 1.15 1.72 0 2.38l-4.02 2.28-.08.05Z"
      />
      <path
        fill="#FF3A44"
        d="m17.28 15.46-3.48-3.48-10.2 10.2c.38.4 1 .45 1.71.05l11.97-6.77Z"
      />
      <path
        fill="#00F076"
        d="M17.28 8.5 5.31 1.74C4.6 1.34 3.98 1.39 3.6 1.8l10.2 10.18 3.48-3.48Z"
      />
    </svg>
  );
}
