import { Image } from 'expo-image';

import { useSection } from '@/features/section/hooks/useSection';

// Section-branded wordmarks (fingerprint icon + "BtLee egypt"). Each section
// ships its own artwork; the active section is read from the store so the logo
// swaps together with the section switcher and its brand colors.
//   properties → silver/gold artwork
//   cars       → blue/white artwork
const LOGOS = {
  properties: { source: require('@/assets/brand/btlee-properties-logo.png'), aspect: 690 / 287 },
  cars: { source: require('@/assets/brand/btlee-cars-logo.png'), aspect: 681 / 246 },
} as const;

export function Logo({ height = 30 }: { height?: number }) {
  const { section } = useSection();
  const { source, aspect } = LOGOS[section];

  return (
    <Image
      source={source}
      style={{ height, width: height * aspect }}
      contentFit="contain"
      accessibilityLabel="Bt Lee"
    />
  );
}
