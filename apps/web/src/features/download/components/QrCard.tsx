'use client';
/**
 * Play Store QR with its hint beside it. Desktop-only wherever it is used: a
 * phone cannot scan its own screen, so small viewports rely on the badge.
 *
 * The SVG is pre-rendered by scripts/make-download-assets.mjs and served as a
 * plain <img> — next/image would only spend Vercel optimization quota on it.
 */
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';

export function QrCard({ tone = 'light', size = 84 }: { tone?: 'light' | 'dark'; size?: number }) {
  const t = useTranslations('download.hero');
  const locale = useLocale() === 'ar' ? 'ar' : 'en';

  return (
    <div className="hidden items-center gap-3.5 lg:flex">
      <div className="rounded-xl bg-white p-2 ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/app-download/qr-${locale}.svg`}
          alt={t('qrHint')}
          width={size}
          height={size}
          style={{ width: size, height: size }}
        />
      </div>
      <span
        className={cn(
          'max-w-[8.5rem] text-start text-sm leading-snug',
          tone === 'dark' ? 'text-white/65' : 'text-muted-foreground',
        )}
      >
        {t('qrHint')}
      </span>
    </div>
  );
}
