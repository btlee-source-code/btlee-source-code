import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/features/theme/hooks/useTheme';

/**
 * A placeholder block with a shimmer sweep — a soft light band glides across
 * the muted surface on a loop (the premium loading look). Size it with
 * className/style. Measures its own width so the sweep travels edge to edge.
 */
export function Skeleton({ className, style }: { className?: string; style?: StyleProp<ViewStyle> }) {
  const { isDark } = useTheme();
  const [w, setW] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (w === 0) return;
    progress.value = 0;
    progress.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [w, progress]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-w, w]) }],
  }));

  // Light band — bright over the pale surface, whisper-soft over the dark one.
  const highlight = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)';

  return (
    <View
      className={`bg-secondary overflow-hidden ${className ?? ''}`}
      style={style}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
          <LinearGradient
            colors={['transparent', highlight, 'transparent']}
            locations={[0.3, 0.5, 0.7]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}
    </View>
  );
}

/** Placeholder matching the PropertyCard layout — for lists and carousels. */
export function SkeletonPropertyCard() {
  return (
    <View>
      <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: 4 / 3 }} />
      <View className="pt-3 gap-2 items-end">
        <Skeleton className="h-4 w-3/5 rounded-full" />
        <Skeleton className="h-3 w-2/5 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Skeleton className="h-4 w-1/3 rounded-full mt-1" />
      </View>
    </View>
  );
}
