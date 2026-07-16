import { Image } from 'expo-image';
import { View } from 'react-native';

import { useSection } from '@/features/section/hooks/useSection';
import { useTheme } from '@/features/theme/hooks/useTheme';

// Section-branded wordmarks (fingerprint icon + "BtLee egypt"). Each section
// ships its own artwork; the active section is read from the store so the logo
// swaps together with the section switcher and its brand colors.
//   properties → silver/gold artwork
//   cars       → blue/white artwork
// `scale` normalizes the VISIBLE size across the two artworks: the properties
// PNG has more internal padding, so at the same height it looks smaller than the
// cars one — bump it up so both read the same size.
// Logo artwork is the single source of truth in `@btlee/shared/logos` (shared
// with the web). Aspect ratios track each PNG's real pixel dimensions so the
// wordmark never distorts; `scale` normalizes visible size across the two.
const LOGOS = {
  properties: { source: require('@btlee/shared/logos/btlee-properties-logo.png'), aspect: 489 / 259, scale: 1.22 },
  cars: { source: require('@btlee/shared/logos/btlee-cars-logo.png'), aspect: 1748 / 899, scale: 1.22 },
} as const;

export function Logo({ height = 30 }: { height?: number }) {
  const { section } = useSection();
  const { isDark } = useTheme();
  const { source, aspect, scale } = LOGOS[section];
  const h = height * scale;
  const width = h * aspect;

  // The cars logo is light-coloured (white/cyan), so on the white light-mode
  // background it disappears. Add a shape-following shadow (a dark tinted copy
  // behind the artwork) — cars section + light mode only.
  const needsShadow = section === 'cars' && !isDark;

  if (needsShadow) {
    return (
      <View style={{ width, height: h }}>
        <Image
          source={source}
          tintColor="rgba(0,0,0,0.45)"
          style={{ position: 'absolute', top: 1.5, left: 1.5, width, height: h }}
          contentFit="contain"
        />
        <Image
          source={source}
          style={{ width, height: h }}
          contentFit="contain"
          accessibilityLabel="Bt Lee"
        />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={{ height: h, width }}
      contentFit="contain"
      accessibilityLabel="Bt Lee"
    />
  );
}
