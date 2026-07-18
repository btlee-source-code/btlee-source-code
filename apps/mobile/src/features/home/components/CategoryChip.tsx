import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
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

import type { ReactElement } from 'react';

import type { Icon3D } from '@/assets/icons3d/registry';
import { shadows } from '@/shared/lib/shadows';

type Props = {
  label: string;
  /** 3D icon — a real image if provided, otherwise the emoji stand-in. */
  icon: Icon3D;
  /** Optional clean monochrome vector icon; takes priority over `icon` and is
   *  tinted with `accent`. Used for the consistent car body-type set. */
  Svg?: (props: { size: number; color: string }) => ReactElement;
  /** Section accent — tints the subtle border (and the vector icon). */
  accent: string;
  /** Stagger index so the idle float of neighbouring chips is out of phase. */
  index?: number;
  onPress: () => void;
};

const ICON = 38; // 3D icons read best a touch larger than the old line icon

/**
 * Category chip with an Airbnb-style 3D icon — but livelier: the icon breathes
 * with a gentle continuous float, then springs (with a haptic tick) on tap. Shows
 * a 3D emoji until a real 3D image is dropped into the registry — both render in
 * Expo Go (no native module), so it always works while developing.
 */
export function CategoryChip({ label, icon, Svg, accent, index = 0, onPress }: Props) {
  // Idle "breathing" float — subtle vertical drift, phase-offset per chip.
  const float = useSharedValue(0);
  // A second, out-of-sync loop drives a gentle rocking rotation.
  const sway = useSharedValue(0);
  // Press pop — a quick squish then springy overshoot back to rest.
  const scale = useSharedValue(1);

  useEffect(() => {
    float.value = withDelay(
      index * 160,
      withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
    sway.value = withDelay(
      index * 160,
      withRepeat(withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, [float, sway, index]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.value - 0.5) * 5 }, // bob ±2.5px
      { rotate: `${(sway.value - 0.5) * 10}deg` }, // rock ±5°
      { scale: scale.value * (0.97 + float.value * 0.06) }, // breathe
    ],
  }));

  const onTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    scale.value = withSequence(
      withTiming(0.82, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1.12, { damping: 5, stiffness: 220 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    onPress();
  };

  return (
    <Pressable
      onPress={onTap}
      className="items-center justify-center gap-1.5 w-full h-[80px] rounded-2xl border bg-card px-2 active:bg-secondary"
      style={[shadows.sm, { borderColor: `${accent}4D` }]}>
      <Animated.View style={[{ width: ICON, height: ICON, alignItems: 'center', justifyContent: 'center' }, iconStyle]}>
        {Svg != null ? (
          <Svg size={ICON} color={accent} />
        ) : icon.image != null ? (
          <Image source={icon.image} style={{ width: ICON, height: ICON }} contentFit="contain" />
        ) : (
          <Text style={{ fontSize: ICON - 8, lineHeight: ICON + 2 }}>{icon.emoji}</Text>
        )}
      </Animated.View>
      <Text className="text-xs font-cairo-semibold text-foreground">{label}</Text>
    </Pressable>
  );
}
