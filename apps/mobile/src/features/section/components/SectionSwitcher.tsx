import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { SECTION_ICONS } from '@/assets/icons3d/registry';
import type { Section } from '@/config/theme';
import { S } from '@/config/strings';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';

const OPTIONS: { key: Section; label: () => string }[] = [
  { key: 'properties', label: () => S.sectionProperties },
  { key: 'cars', label: () => S.sectionCars },
];

const ICON = 26; // 3D icons read best a touch larger than the old line icon

/**
 * Segmented toggle that switches the active section (properties ⇄ cars). Each
 * pill carries a professional 3D icon (Fluent 3D — a house for properties, a car
 * for cars) beside its label. The active pill uses a per-section brand color:
 * GOLD (accent) for properties, BLUE (primary) for cars — so the control
 * reflects the active brand. Flipping it re-tints the whole app + swaps the logo.
 */
export function SectionSwitcher() {
  const { section, setSection } = useSection();
  const c = useThemeColors();

  // The active pill is always the current section: properties → gold (accent),
  // cars → blue (primary). White foreground works on both.
  const activeBg = section === 'cars' ? c.primary : c.accent;
  const activeFg = section === 'cars' ? c.primaryForeground : c.accentForeground;

  return (
    <View className="flex-row bg-secondary border border-border rounded-2xl p-1">
      {OPTIONS.map(({ key, label }) => {
        const active = section === key;
        return (
          <PressableScale
            key={key}
            haptic
            scaleTo={0.97}
            onPress={() => setSection(key)}
            containerClassName="flex-1"
            className="flex-row items-center justify-center gap-2 rounded-xl py-2"
            style={active ? { backgroundColor: activeBg } : undefined}>
            <Image
              source={SECTION_ICONS[key]}
              style={{ width: ICON, height: ICON }}
              contentFit="contain"
            />
            <Text className="font-cairo-bold text-[14px]" style={{ color: active ? activeFg : c.muted }}>
              {label()}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
