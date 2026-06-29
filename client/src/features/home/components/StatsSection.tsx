'use client';
/**
 * Stats strip — animated counters that count up when the section enters view.
 * Values are static placeholders representing platform momentum.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { Home, Users, MapPin, TrendingUp } from 'lucide-react';

interface Stat {
  icon: typeof Home;
  value: number;
  suffix: string;
  labelKey: 'statsProperties' | 'statsUsers' | 'statsCities' | 'statsDeals';
}

const stats: Stat[] = [
  { icon: Home, value: 1200, suffix: '+', labelKey: 'statsProperties' },
  { icon: Users, value: 8500, suffix: '+', labelKey: 'statsUsers' },
  { icon: MapPin, value: 27, suffix: '', labelKey: 'statsCities' },
  { icon: TrendingUp, value: 450, suffix: '+', labelKey: 'statsDeals' },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const t = useTranslations('home');

  return (
    // No explicit z-index: it would create a stacking context that pulls the
    // card above the Hero search dropdown when it opens. Document order is
    // enough — the negative margin still lifts the card over the Hero bottom.
    <section className="relative -mt-12 md:-mt-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-card shadow-2xl border border-border/60 px-6 py-7 md:px-10 md:py-9"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.labelKey}
                className={`flex items-center gap-4 ${
                  i > 0 ? 'lg:border-s lg:border-border/70 lg:ps-6' : ''
                }`}
              >
                <div className="flex-shrink-0 inline-flex size-12 md:size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="size-6 md:size-7" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl md:text-3xl font-extrabold text-foreground leading-none tabular-nums">
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium mt-1.5 truncate">
                    {t(stat.labelKey)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
