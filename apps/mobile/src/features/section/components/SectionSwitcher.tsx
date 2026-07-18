import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PROPERTY_ICONS } from '@/assets/icons3d/registry';
import type { Section } from '@/config/theme';
import { S } from '@/config/strings';
import { CAR_BODY_SVG } from '@/features/cars/components/CarBodyIcons';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';

// The "hatchback" body-type icon from the explore-by-type grid.
const HatchbackIcon = CAR_BODY_SVG.hatchback;

const OPTIONS: { key: Section; label: () => string }[] = [
  { key: 'properties', label: () => S.sectionProperties },
  { key: 'cars', label: () => S.sectionCars },
];

/**
 * Segmented toggle that switches the active section (properties ⇄ cars). Each
 * pill carries the same icon as its explore-by-type grid — a villa for
 * properties, a hatchback for cars — which gently breathes when idle and pops
 * when tapped. The active pill uses a per-section brand color: GOLD (accent) for
 * properties, BLUE (primary) for cars. Flipping it re-tints the app + logo.
 */
export function SectionSwitcher() {
  const { section, setSection } = useSection();
  const c = useThemeColors();

  const activeBg = section === 'cars' ? c.primary : c.accent;
  const activeFg = section === 'cars' ? c.primaryForeground : c.accentForeground;

  return (
    <View className="flex-row bg-secondary border border-border rounded-2xl p-1">
      {OPTIONS.map(({ key, label }, i) => (
        <Pill
          key={key}
          index={i}
          active={section === key}
          activeBg={activeBg}
          activeFg={activeFg}
          mutedColor={c.muted}
          label={label()}
          onPress={() => setSection(key)}
          icon={
            key === 'properties' ? (
              <Text style={{ fontSize: 29, lineHeight: 36 }}>{PROPERTY_ICONS.villa.emoji}</Text>
            ) : (
              <HatchbackIcon size={36} />
            )
          }
        />
      ))}
    </View>
  );
}

function Pill({
  index,
  active,
  activeBg,
  activeFg,
  mutedColor,
  label,
  icon,
  onPress,
}: {
  index: number;
  active: boolean;
  activeBg: string;
  activeFg: string;
  mutedColor: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  // Press pop (squish → springy overshoot) layered over a gentle idle breathe.
  const scale = useSharedValue(1);
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withDelay(
      index * 500,
      withRepeat(withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, [float, index]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.value - 0.5) * 3 }, // bob ±1.5px when idle
      { scale: scale.value * (0.97 + float.value * 0.06) }, // subtle breathe
    ],
  }));

  const onTap = () => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1.18, { damping: 5, stiffness: 220 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    onPress();
  };

  return (
    <PressableScale
      haptic
      scaleTo={0.97}
      onPress={onTap}
      containerClassName="flex-1"
      className="flex-row items-center justify-center gap-2 rounded-xl py-2"
      style={active ? { backgroundColor: activeBg } : undefined}>
      <Animated.View style={iconStyle}>{icon}</Animated.View>
      <Text className="font-cairo-bold text-[14px]" style={{ color: active ? activeFg : mutedColor }}>
        {label}
      </Text>
    </PressableScale>
  );
}
