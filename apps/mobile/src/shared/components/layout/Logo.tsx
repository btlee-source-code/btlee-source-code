import { Image } from 'expo-image';

import { useTheme } from '@/features/theme/hooks/useTheme';

// The site's brand wordmark (same assets as the web navbar), swapped by theme:
//   light mode → the default (dark-coloured) logo,
//   dark mode  → the light-green logo, legible on the near-black background.
// Both artworks share the same 697×151 canvas so they render identically.
const LOGO_LIGHT = require('@/assets/brand/btlee-logo.png');
const LOGO_DARK = require('@/assets/brand/btlee-logo-dark.png');
const ASPECT = 697 / 151;

export function Logo({ height = 30 }: { height?: number }) {
  const { isDark } = useTheme();
  return (
    <Image
      source={isDark ? LOGO_DARK : LOGO_LIGHT}
      style={{ height, width: height * ASPECT }}
      contentFit="contain"
      accessibilityLabel="Bt Lee"
    />
  );
}
