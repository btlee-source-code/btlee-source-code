'use client';
/**
 * What fills the space around the hero's handsets: a column grid for structure
 * and three fragments lifted from the app itself — a push notification, the
 * WhatsApp button and the no-commission tag.
 *
 * The fragments are placed against the section, a comfortable margin in from
 * the screen edges, and only from xl up: that is the only width with real room
 * beside the phones. Below it the hero stays on the phones alone.
 */
import type { MotionValue } from 'framer-motion';
import { motion, useTransform } from 'framer-motion';
import { BellRing, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Column hairlines, behind everything. Two columns on phones, four from lg. */
export function HeroGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="container mx-auto grid h-full grid-cols-2 px-4 lg:grid-cols-4">
        <div className="border-s border-foreground/10" />
        <div className="border-s border-foreground/10 lg:border-e-0" />
        <div className="hidden border-s border-foreground/10 lg:block" />
        <div className="hidden border-s border-e border-foreground/10 lg:block" />
      </div>
    </div>
  );
}

/** The app fragments, in the hero's flanks. */
export function HeroFragments({ drift }: { drift: MotionValue<number> }) {
  const t = useTranslations('download.hero.cards');

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block"
    >
      <Floating className="left-[6%] top-[46%]" drift={drift} distance={-52} delay={0}>
        <div className="w-60 rounded-2xl border border-border bg-card p-4 shadow-[0_18px_40px_-20px_rgba(8,20,16,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-bold leading-snug text-foreground">
              <BellRing className="size-3.5 shrink-0 text-primary" />
              {t('alertTitle')}
            </span>
            <span className="shrink-0 text-[0.65rem] text-muted-foreground">{t('alertTime')}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t('alertBody')}</p>
        </div>
      </Floating>

      <Floating className="right-[7%] top-[40%]" drift={drift} distance={-78} delay={1.2}>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[0.8rem] font-bold text-white shadow-[0_16px_30px_-16px_rgba(37,211,102,0.85)]">
          <MessageCircle className="size-3.5" />
          {t('whatsapp')}
        </span>
      </Floating>

      <Floating className="right-[11%] top-[62%]" drift={drift} distance={-34} delay={0.6}>
        <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 text-[0.8rem] font-semibold text-foreground shadow-md">
          <span className="size-2 rounded-full bg-accent" />
          {t('noCommission')}
        </span>
      </Floating>
    </div>
  );
}

/**
 * One fragment: drifts with the page (slower than the phones, for depth) and
 * breathes on a long loop of its own.
 */
function Floating({
  children,
  className,
  drift,
  distance,
  delay,
}: {
  children: React.ReactNode;
  className: string;
  /** Runs 0 → 1 across the hero's scroll. */
  drift: MotionValue<number>;
  /** How far this fragment travels over that scroll, in pixels. */
  distance: number;
  delay: number;
}) {
  const y = useTransform(drift, [0, 1], [0, distance]);

  return (
    <motion.div style={{ y }} className={`absolute ${className}`}>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
