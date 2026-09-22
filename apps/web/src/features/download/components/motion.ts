import type { Variants } from 'framer-motion';

/** Shared easing — a soft "expo out" that settles gently. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const stagger = (gap = 0.1, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT } },
};

/** Viewport config shared by every scroll-revealed block on the page. */
export const REVEAL = { once: true, margin: '-80px' } as const;
