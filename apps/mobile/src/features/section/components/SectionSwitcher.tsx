import { Building2, Car } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { Section } from '@/config/theme';
import { S } from '@/config/strings';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';

const OPTIONS: { key: Section; label: () => string; Icon: typeof Building2 }[] = [
  { key: 'properties', label: () => S.sectionProperties, Icon: Building2 },
  { key: 'cars', label: () => S.sectionCars, Icon: Car },
];

/**
 * Segmented toggle that switches the active section (properties ⇄ cars).
 * The active pill uses a per-section brand color: GOLD (accent) for properties,
 * BLUE (primary) for cars — so the control reflects the active brand. Flipping
 * it re-tints the whole app + swaps the logo via the store.
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
      {OPTIONS.map(({ key, label, Icon }) => {
        const active = section === key;
        return (
          <PressableScale
            key={key}
            haptic
            scaleTo={0.97}
            onPress={() => setSection(key)}
            containerClassName="flex-1"
            className="flex-row items-center justify-center gap-2 rounded-xl py-2.5"
            style={active ? { backgroundColor: activeBg } : undefined}>
            <Icon size={18} color={active ? activeFg : c.muted} strokeWidth={2.2} />
            <Text className="font-cairo-bold text-[14px]" style={{ color: active ? activeFg : c.muted }}>
              {label()}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
