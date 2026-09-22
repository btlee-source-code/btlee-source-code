'use client';
/**
 * Above-the-fold hero for /download — a quiet, light stage: one large
 * statement, the store badge, and a fan of three handsets rising from the
 * bottom edge. As the page scrolls, the side phones swing outward and the
 * centre one lifts, so the hero opens up on its way out instead of just
 * sliding off.
 */
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HeroFragments, HeroGrid } from './HeroBackdrop';
import { Mockup } from './Mockup';
import { PlayBadge } from './PlayBadge';
import { QrCard } from './QrCard';
import { EASE_OUT, fadeUp, stagger } from './motion';

export function DownloadHero() {
  const t = useTranslations('download.hero');
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const spread = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const leftX = useTransform(spread, [0, 1], ['0%', '-16%']);
  const rightX = useTransform(spread, [0, 1], ['0%', '16%']);
  const leftRotate = useTransform(spread, [0, 1], [-6, -12]);
  const rightRotate = useTransform(spread, [0, 1], [6, 12]);
  const centerY = useTransform(spread, [0, 1], [0, -70]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-background">
      {/* A soft floor of light behind the phones, then the column grid and
          the floating app fragments that fill the flanks on wide screens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(55%_65%_at_50%_100%,hsl(var(--primary)/0.10),transparent)]"
      />
      <HeroGrid />
      <HeroFragments drift={spread} />

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        className="container relative mx-auto px-4 pt-12 text-center sm:pt-16 lg:pt-20"
      >
        <motion.h1
          variants={fadeUp}
          className="mx-auto max-w-3xl text-[2rem] font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          {t('title')}
          {/* Own line: otherwise the phrase splits across the wrap. */}
          <span className="block text-primary">{t('titleAccent')}</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base lg:text-lg"
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          <PlayBadge size="lg" />
          <QrCard />
        </motion.div>

        <motion.p variants={fadeUp} className="mt-5 text-sm text-muted-foreground">
          {t('availability')}
        </motion.p>
      </motion.div>

      {/* Phone fan. The section clips its bottom, so the phones rise out of
          the edge; the centre sits on top, the sides tuck in behind it. */}
      <div className="relative mx-auto mt-14 h-[21rem] max-w-5xl sm:h-[27rem] lg:mt-16 lg:h-[31rem]">
        <motion.div
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.5 }}
          className="absolute left-1/2 top-10 z-10 w-32 -translate-x-[150%] sm:top-12 sm:w-48 sm:-translate-x-[135%] lg:top-16 lg:w-64 lg:-translate-x-[132%]"
        >
          <motion.div style={{ x: leftX, rotate: leftRotate }}>
            <Mockup screen="02-property-details" eager />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.5 }}
          className="absolute left-1/2 top-10 z-10 w-32 translate-x-[50%] sm:top-12 sm:w-48 sm:translate-x-[35%] lg:top-16 lg:w-64 lg:translate-x-[32%]"
        >
          <motion.div style={{ x: rightX, rotate: rightRotate }}>
            <Mockup screen="04-cars-home" eager />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 140 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
          className="absolute left-1/2 top-0 z-20 w-52 -translate-x-1/2 sm:w-64 lg:w-80"
        >
          <motion.div style={{ y: centerY }}>
            <Mockup screen="01-properties-home" eager />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
