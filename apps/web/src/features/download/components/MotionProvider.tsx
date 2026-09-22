'use client';
/**
 * Page-wide motion settings. `reducedMotion="user"` makes every framer-motion
 * transform/layout animation on the page (floating chips, parallax, the
 * showcase cross-fades) stand down for visitors who enable "reduce motion" in
 * their OS, while plain opacity fades keep working.
 */
import { MotionConfig } from 'framer-motion';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
