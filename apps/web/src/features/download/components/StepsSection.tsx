'use client';
/**
 * Three-step start guide as a timeline: a rail runs through the step markers
 * and fills with the brand colour as the visitor scrolls, lighting each
 * marker as the fill reaches it. Horizontal from md up, vertical below.
 */
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { SectionHeader } from './SectionHeader';
import { REVEAL, fadeUp, stagger } from './motion';

export function StepsSection() {
  const t = useTranslations('download.steps');
  const items = t.raw('items') as { title: string; desc: string }[];
  const listRef = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);

  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 85%', 'end 55%'] });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    // Marker i lights up once the fill has travelled i / (n - 1) of the rail.
    setReached(Math.floor(progress * (items.length - 1) + 0.001));
  });

  return (
    <section className="bg-background py-24 lg:py-32">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="container mx-auto px-4">
        <motion.ol
          ref={listRef}
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={REVEAL}
          className="relative mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8"
        >
          {/* Horizontal rail (md+): from the first marker's centre to the last
              one's. Columns are (100% - 2 gaps) / 3 wide, so the last marker's
              centre sits one column minus half a marker from the end. */}
          <div className="pointer-events-none absolute start-5 top-5 hidden h-px bg-border md:block md:end-[calc((100%_-_4rem)/3_-_1.25rem)]">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full origin-left bg-primary rtl:origin-right"
            />
          </div>
          {/* Vertical rail (below md). */}
          <div className="pointer-events-none absolute bottom-16 start-5 top-5 w-px bg-border md:hidden">
            <motion.div style={{ scaleY: scrollYProgress }} className="size-full origin-top bg-primary" />
          </div>

          {items.map((item, i) => (
            <motion.li key={item.title} variants={fadeUp} className="relative ps-16 md:ps-0">
              <span
                className={cn(
                  'absolute start-0 top-0 z-10 flex size-10 items-center justify-center rounded-full border text-sm font-bold tabular-nums transition-colors duration-500 md:static',
                  reached >= i
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                {i + 1}
              </span>
              <h3 className="pt-1.5 text-xl font-bold text-foreground md:mt-8 md:pt-0 lg:text-2xl">
                {item.title}
              </h3>
              <p className="mt-2.5 max-w-xs text-base leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
