'use client';
/**
 * Why the app — an editorial, numbered list rather than a grid of icon cards.
 * The heading sticks beside the list on large screens while the rows scroll
 * past it, and each row's hairline draws itself in as it enters.
 */
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { EASE_OUT, REVEAL, fadeUp } from './motion';

const drawLine = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } },
};

export function FeatureList() {
  const t = useTranslations('download.features');
  const items = t.raw('items') as { title: string; desc: string }[];

  return (
    // No overflow clipping here: the heading below is sticky.
    <section className="bg-secondary/40 py-24 lg:py-32">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={REVEAL}
            className="lg:sticky lg:top-32"
          >
            <h2 className="text-[2.25rem] font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t('title')}
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground lg:text-lg">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <ol className="lg:col-span-7">
          {items.map((item, i) => (
            <motion.li
              key={item.title}
              initial="hidden"
              whileInView="show"
              viewport={REVEAL}
              className="group relative py-8 lg:py-10"
            >
              <motion.span
                aria-hidden
                variants={drawLine}
                className="absolute inset-x-0 top-0 h-px origin-left bg-foreground/15 rtl:origin-right"
              />
              <motion.div variants={fadeUp} className="flex gap-5 sm:gap-8 lg:gap-12">
                <span className="w-7 shrink-0 pt-1.5 text-sm font-bold tabular-nums text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl lg:text-[1.75rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            </motion.li>
          ))}
          <motion.li
            aria-hidden
            initial="hidden"
            whileInView="show"
            viewport={REVEAL}
            variants={drawLine}
            className="h-px origin-left bg-foreground/15 rtl:origin-right"
          />
        </ol>
      </div>
    </section>
  );
}
