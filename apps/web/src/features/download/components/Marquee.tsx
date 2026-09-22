'use client';
/**
 * Slow, endless band of what the app covers — property types, cars and the
 * platform's promises — right under the hero.
 *
 * The track holds the list twice and slides by exactly half its width, so the
 * loop is seamless. Each item carries its own padding instead of the track
 * using `gap`, which keeps both halves the same width to the pixel. The track
 * is laid out LTR in both locales to keep that arithmetic simple; the words
 * themselves still render in their own direction, and Arabic runs the other
 * way so it reads with the text.
 */
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export function Marquee() {
  const t = useTranslations('download');
  const isArabic = useLocale() === 'ar';
  const items = t.raw('marquee') as string[];
  const track = [...items, ...items];

  return (
    <section className="overflow-hidden border-y border-border bg-background py-4 lg:py-5">
      <div dir="ltr" className="flex">
        <motion.ul
          animate={{ x: isArabic ? ['-50%', '0%'] : ['0%', '-50%'] }}
          transition={{ duration: 48, ease: 'linear', repeat: Infinity }}
          className="flex w-max shrink-0 items-center"
        >
          {track.map((item, i) => (
            <li
              key={i}
              // The second half only exists for the loop — hide it from readers.
              aria-hidden={i >= items.length}
              className="flex items-center gap-6 whitespace-nowrap px-3 text-lg font-bold text-foreground/85 sm:text-xl lg:gap-8 lg:px-4 lg:text-2xl"
            >
              {item}
              <span className="size-1.5 shrink-0 rounded-full bg-accent" />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
