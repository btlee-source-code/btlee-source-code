'use client';
/**
 * Closing call to action — a full-bleed ink band. The copy and the store
 * prompts sit on one side; on the other, a handset rises out of the bottom
 * edge, lifting into place as the band scrolls into view.
 *
 * This one uses the tilted 3D render (the same one the home page's download
 * section shows, built by scripts/make-download-assets.mjs) rather than the
 * upright mockups the rest of the page uses.
 */
import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlayBadge } from './PlayBadge';
import { QrCard } from './QrCard';
import { REVEAL, fadeUp, stagger } from './motion';

export function DownloadCta() {
  const t = useTranslations('download.cta');
  const locale = useLocale() === 'ar' ? 'ar' : 'en';
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const phoneY = useTransform(scrollYProgress, [0, 1], ['10%', '0%']);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#0d1411] text-white dark:border-t dark:border-white/10 dark:bg-[#111a16]"
    >
      <div className="container mx-auto grid items-end gap-14 px-4 pb-14 pt-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20 lg:pb-20 lg:pt-28">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={REVEAL}
          className="text-center lg:pb-10 lg:text-start"
        >
          <motion.h2
            variants={fadeUp}
            className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg lg:mx-0"
          >
            {t('subtitle')}
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start"
          >
            <PlayBadge size="lg" />
            <QrCard tone="dark" />
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-sm text-white/45">
            {t('availability')}
          </motion.p>
        </motion.div>

        {/* Shown whole — it only drifts up a little as the band arrives. */}
        <div className="mx-auto w-56 sm:w-64 lg:mx-0 lg:w-[19rem]">
          <motion.div style={{ y: phoneY }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/app-download/app-mockup-${locale}.webp`}
              alt=""
              width={640}
              height={locale === 'ar' ? 1151 : 1198}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
