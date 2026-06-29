'use client';
/**
 * Star rating primitives.
 *
 * - StarRating: read-only display that supports fractional values. Empty stars
 *   sit underneath a clipped layer of gold (accent) stars whose visible width
 *   equals value/5. The clip is width-based from the inline-start edge, so it
 *   fills correctly in both LTR and RTL.
 * - StarRatingInput: interactive 1–5 picker with hover preview.
 *
 * Both use the gold `accent` token for fills, so they look at home in light
 * and dark mode without any per-theme overrides.
 */
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

function StarRow({
  size,
  gap,
  filled,
  width,
}: {
  size: number;
  gap: number;
  filled: boolean;
  width?: number;
}) {
  return (
    <div className="flex shrink-0" style={{ gap, width }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          strokeWidth={1.5}
          className={filled ? 'fill-accent text-accent' : 'fill-transparent text-muted-foreground/35'}
        />
      ))}
    </div>
  );
}

export function StarRating({
  value,
  size = 16,
  gap = 2,
  className,
}: {
  value: number;
  size?: number;
  gap?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(5, value)) / 5 * 100;
  const fullWidth = size * 5 + gap * 4;

  return (
    <div
      className={cn('relative inline-flex', className)}
      role="img"
      aria-label={`${value.toFixed(1)} / 5`}
    >
      <StarRow size={size} gap={gap} filled={false} />
      <div
        className="absolute top-0 start-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <StarRow size={size} gap={gap} filled width={fullWidth} />
      </div>
    </div>
  );
}

export function StarRatingInput({
  value,
  onRate,
  size = 30,
  gap = 4,
  disabled = false,
  className,
}: {
  value: number;
  onRate: (value: number) => void;
  size?: number;
  gap?: number;
  disabled?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className={cn('inline-flex', className)}
      style={{ gap }}
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const on = active >= idx;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(idx)}
            onClick={() => !disabled && onRate(idx)}
            aria-label={`${idx} / 5`}
            className={cn(
              'transition-transform',
              disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
            )}
          >
            <Star
              style={{ width: size, height: size }}
              strokeWidth={1.5}
              className={cn(
                'transition-colors',
                on ? 'fill-accent text-accent' : 'fill-transparent text-muted-foreground/40'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
