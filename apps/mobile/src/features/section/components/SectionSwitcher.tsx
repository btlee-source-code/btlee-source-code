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
 * Segmented toggle that switches the active section (properties ⇄ cars). The
 * active pill uses `bg-primary`, which is the CURRENT section's brand color, so
 * the control itself reflects the active brand (green for properties, blue for
 * cars). Flipping it re-tints the whole app + swaps the logo via the store.
 */
export function SectionSwitcher() {
  const { section, setSection } = useSection();
  const c = useThemeColors();

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
            className={`flex-row items-center justify-center gap-2 rounded-xl py-2.5 ${active ? 'bg-primary' : ''}`}>
            <Icon size={18} color={active ? c.primaryForeground : c.muted} strokeWidth={2.2} />
            <Text
              className={`font-cairo-bold text-[14px] ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {label()}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
