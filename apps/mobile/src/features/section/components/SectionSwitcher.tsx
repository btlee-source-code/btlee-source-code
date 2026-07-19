import { useEffect, type ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CAR_ICONS, PROPERTY_ICONS } from '@/assets/icons3d/registry';
import type { Section } from '@/config/theme';
import { S } from '@/config/strings';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { shadows } from '@/shared/lib/shadows';

const OPTIONS: { key: Section; label: () => string }[] = [
  { key: 'properties', label: () => S.sectionProperties },
  { key: 'cars', label: () => S.sectionCars },
];

/**
 * Segmented toggle that switches the active section (properties ⇄ cars). Each
 * pill carries the same icon as its explore-by-type grid — a villa for
 * properties, an SUV for cars — which performs a short idle flourish every four
 * seconds and pops when tapped. The active pill uses a per-section brand color:
 * GOLD (accent) for properties, BLUE (primary) for cars. Flipping it re-tints
 * the app + logo.
 */
export function SectionSwitcher() {
  const { section, setSection } = useSection();
  const c = useThemeColors();

  const activeBg = section === 'cars' ? c.primary : c.accent;
  const activeFg = section === 'cars' ? c.primaryForeground : c.accentForeground;

  return (
    <View
      className="w-[90%] max-w-[360px] self-center flex-row gap-1 rounded-[18px] p-1"
      style={[shadows.sm, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}>
      {OPTIONS.map(({ key, label }, i) => (
        <Pill
          key={key}
          index={i}
          active={section === key}
          activeBg={activeBg}
          activeFg={activeFg}
          borderColor={c.border}
          inactiveBg={c.secondary}
          inactiveFg={c.foreground}
          label={label()}
          onPress={() => setSection(key)}
          icon={
            key === 'properties' ? (
              <Text style={{ fontSize: 24, lineHeight: 30 }}>{PROPERTY_ICONS.villa.emoji}</Text>
            ) : (
              <Image
                source={CAR_ICONS.suv.image}
                style={{ width: 46, height: 30 }}
                resizeMode="contain"
                fadeDuration={0}
              />
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
  borderColor,
  inactiveBg,
  inactiveFg,
  label,
  icon,
  onPress,
}: {
  index: number;
  active: boolean;
  activeBg: string;
  activeFg: string;
  borderColor: string;
  inactiveBg: string;
  inactiveFg: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  // A press pop layered over a short, staggered idle flourish every four seconds.
  const scale = useSharedValue(1);
  const idlePulse = useSharedValue(0);
  const interacting = useSharedValue(0);

  useEffect(() => {
    idlePulse.value = withDelay(
      index * 450,
      withRepeat(
        withSequence(
          withDelay(3100, withTiming(0, { duration: 0 })),
          withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 640, easing: Easing.out(Easing.elastic(1.15)) })
        ),
        -1,
        false
      )
    );

    return () => cancelAnimation(idlePulse);
  }, [idlePulse, index]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -4 * idlePulse.value * (1 - interacting.value) },
      { rotate: `${(index === 0 ? -3 : 3) * idlePulse.value * (1 - interacting.value)}deg` },
      { scale: scale.value * (1 + 0.1 * idlePulse.value * (1 - interacting.value)) },
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
      onPressIn={() => {
        interacting.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        interacting.value = withTiming(0, { duration: 180 });
      }}
      containerClassName="flex-1"
      className="min-h-[64px] items-center justify-center rounded-[14px] px-2 py-1"
      style={[
        {
          backgroundColor: active ? activeBg : inactiveBg,
          borderColor: active ? `${activeFg}4D` : borderColor,
          borderWidth: 1,
        },
        active ? shadows.md : undefined,
      ]}>
      <Animated.View
        style={[
          { width: 52, height: 31, alignItems: 'center', justifyContent: 'center' },
          iconStyle,
        ]}>
        {icon}
      </Animated.View>
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={1.15}
        style={{
          color: active ? activeFg : inactiveFg,
          fontFamily: 'NotoKufiArabic_800ExtraBold',
          fontSize: 14,
          lineHeight: 24,
        }}>
        {label}
      </Text>
    </PressableScale>
  );
}
