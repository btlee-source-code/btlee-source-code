'use client';
/**
 * Scroll-driven walkthrough — the centrepiece of the page, on every screen size.
 *
 * A tall track (one scroll stretch per step) holds a stage pinned to the
 * viewport. How far the visitor has scrolled through the track picks the
 * active step: the handset cross-fades to that step's screen and the copy
 * swaps with it, while a counter and a progress rail show where they are.
 * Phones and desktops share the mechanism; only the stage layout differs —
 * copy beside the phone from lg up, above and below it on smaller screens.
 *
 * Nothing above the stage may clip overflow: an ancestor with overflow hidden
 * becomes the sticky element's scroll container and the stage stops pinning.
 */
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Mockup } from './Mockup';
import { SectionHeader } from './SectionHeader';
import { MOCKUP_ASPECT, SHOWCASE_SCREENS } from './mockups';
import { EASE_OUT } from './motion';

type Step = { tag: string; title: string; desc: string };

/** Scroll distance given to each step, in small-viewport heights. */
const STEP_SVH = 85;

const pad = (n: number) => String(n).padStart(2, '0');

export function AppShowcase() {
  const t = useTranslations('download.showcase');
  const steps = t.raw('steps') as Step[];
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(progress * steps.length))));
  });

  // Step list (desktop): jump to the middle of that step's scroll stretch.
  const jumpTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const start = track.getBoundingClientRect().top + window.scrollY;
    const distance = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: start + distance * ((index + 0.5) / steps.length), behavior: 'smooth' });
  };

  const step = steps[active];

  return (
    <section className="bg-background pt-24 lg:pt-32">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />

      <div
        ref={trackRef}
        className="relative mt-6 lg:mt-2"
        style={{ height: `${steps.length * STEP_SVH}svh` }}
      >
        {/* top-16 / 4rem: clears the sticky site navbar. */}
        <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
          <div className="container mx-auto flex h-full flex-col items-center justify-center gap-6 px-4 lg:grid lg:grid-cols-[minmax(0,28rem)_auto] lg:justify-center lg:gap-24">
            {/* Copy column — `contents` below lg so its parts can sit above and
                below the phone in the single-column stage. */}
            <div className="contents lg:flex lg:flex-col">
              {/* Counter + progress rail */}
              <div className="order-1 w-full max-w-sm lg:order-none lg:max-w-none">
                <div className="flex items-end justify-between gap-4 lg:justify-start">
                  <span dir="ltr" className="inline-flex items-baseline gap-2 tabular-nums">
                    <span className="text-4xl font-extrabold leading-none text-primary lg:text-7xl">
                      {pad(active + 1)}
                    </span>
                    <span className="text-base font-semibold text-muted-foreground lg:text-xl">
                      / {pad(steps.length)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-accent lg:hidden">{step.tag}</span>
                </div>
                <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-border lg:mt-6">
                  <motion.div
                    style={{ scaleX: scrollYProgress }}
                    className="h-full origin-left rounded-full bg-primary rtl:origin-right"
                  />
                </div>
              </div>

              {/* Step index — desktop only; each entry jumps to its step. */}
              <ol className="mt-8 hidden lg:block">
                {steps.map((s, i) => (
                  <li key={s.tag}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      className={cn(
                        'flex w-full items-center gap-4 py-2 text-start text-base font-semibold transition-colors duration-300',
                        active === i
                          ? 'text-foreground'
                          : 'text-muted-foreground/70 hover:text-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'h-px shrink-0 transition-all duration-500',
                          active === i ? 'w-10 bg-primary' : 'w-4 bg-border',
                        )}
                      />
                      {s.tag}
                    </button>
                  </li>
                ))}
              </ol>

              {/* Active step copy — fixed height so the stage never jumps. */}
              <div className="order-3 min-h-[8.5rem] w-full max-w-sm text-center lg:order-none lg:mt-10 lg:min-h-[12rem] lg:max-w-none lg:text-start">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  <h3 className="text-2xl font-extrabold leading-tight text-foreground sm:text-3xl lg:text-5xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base lg:mt-5 lg:text-lg">
                    {step.desc}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Handset. Heights are viewport-based on purpose: a percentage
                height would make the grid's auto column collapse to zero. */}
            <div
              className="relative order-2 h-[48svh] max-h-[30rem] lg:order-none lg:h-[min(40rem,74svh)] lg:max-h-none"
              style={{ aspectRatio: MOCKUP_ASPECT }}
            >
              {SHOWCASE_SCREENS.map((screen, i) => (
                <motion.div
                  key={screen}
                  initial={false}
                  animate={{
                    opacity: i === active ? 1 : 0,
                    y: i === active ? 0 : i < active ? -28 : 28,
                    scale: i === active ? 1 : 0.96,
                  }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                  aria-hidden={i !== active}
                  className="absolute inset-0"
                >
                  <Mockup screen={screen} className="size-full" eager={i === 0} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
