'use client';
/**
 * Section heading used across /download: a large title on the start side and
 * the supporting line on the end side (stacked below lg).
 */
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { REVEAL, fadeUp } from './motion';

export function SectionHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={REVEAL}
      className={cn(
        'container mx-auto px-4 lg:flex lg:items-end lg:justify-between lg:gap-16',
        className,
      )}
    >
      <h2 className="max-w-2xl text-[2.25rem] font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground lg:mt-0 lg:pb-2 lg:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
