import type { ViewStyle } from 'react-native';

/**
 * Cross-platform soft shadows (iOS shadow* keys + Android elevation).
 * Android elevation needs an opaque background on the same view — always pair
 * with bg-card / bg-background / a solid color.
 */
export const shadows = {
  /** Hairline lift — search bars, chips, small floating controls. */
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } as ViewStyle,
  /** Standing surface — the home search pill, sticky bars. */
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  } as ViewStyle,
  /** Floating action button. */
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  } as ViewStyle,
  /** Warm gold glow — brand-accent cards and CTAs (mirrors the web's
      `shadow-accent/25`). Android falls back to a plain elevation shadow. */
  gold: {
    shadowColor: '#FDB803',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  } as ViewStyle,
} as const;
