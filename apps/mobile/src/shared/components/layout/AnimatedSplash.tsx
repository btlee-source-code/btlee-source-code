import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { S } from '@/config/strings';
import { useTheme, useThemeColors } from '@/features/theme/hooks/useTheme';
import { Logo } from '@/shared/components/layout/Logo';

const GOLD = '#FDB803';

/**
 * Launch intro — deliberately understated. On a soft off-white (or the dark
 * ground in dark mode) the brand mark eases in with a gentle scale, a short
 * gold rule draws beneath it, and a quiet tagline rises in. The whole overlay
 * then fades to reveal the app. Refined, not flashy.
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const { isDark } = useTheme();
  const c = useThemeColors();
  const background = isDark ? c.background : '#F4F4F3';

  const cover = useSharedValue(1); // whole-overlay opacity
  const logo = useSharedValue(0);
  const line = useSharedValue(0); // gold rule scaleX + opacity
  const tag = useSharedValue(0);

  useEffect(() => {
    logo.value = withTiming(1, { duration: 640, easing: Easing.out(Easing.cubic) });
    line.value = withDelay(360, withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }));
    tag.value = withDelay(560, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    cover.value = withDelay(
      1650,
      withTiming(0, { duration: 480, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, [cover, line, logo, tag]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logo.value,
    transform: [{ scale: 0.93 + logo.value * 0.07 }],
  }));
  const lineStyle = useAnimatedStyle(() => ({ opacity: line.value, transform: [{ scaleX: line.value }] }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tag.value,
    transform: [{ translateY: (1 - tag.value) * 6 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: background, zIndex: 100 }, coverStyle]}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={logoStyle}>
          <Logo height={50} />
        </Animated.View>
        <Animated.View
          style={[{ height: 2.5, width: 52, borderRadius: 2, backgroundColor: GOLD, marginTop: 20 }, lineStyle]}
        />
        <Animated.View style={tagStyle}>
          <Text style={{ marginTop: 14, color: c.muted, fontFamily: 'Cairo_500Medium', fontSize: 12.5 }}>
            {S.introTagline}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
