import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { tapHaptic } from '@/shared/lib/haptics';

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Visual container classes (background, padding, radius…). */
  className?: string;
  /** Layout classes for the outer Pressable (flex-1, self-end…). */
  containerClassName?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  /** How far the content squishes while pressed. */
  scaleTo?: number;
  /** Fire a light haptic tick on press. */
  haptic?: boolean;
  children?: ReactNode;
}

/**
 * Pressable with a springy "squish" — the content scales down under the finger
 * and bounces back on release. The playful press feedback used across the app
 * for cards and CTAs.
 */
export function PressableScale({
  className,
  containerClassName,
  style,
  containerStyle,
  scaleTo = 0.96,
  haptic = false,
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      className={containerClassName}
      style={containerStyle}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 18, stiffness: 420 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 12, stiffness: 320 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tapHaptic();
        onPress?.(e);
      }}
      {...rest}>
      {/* Transform lives on the wrapper; visual styles (bg, shadow/elevation)
          live on the inner View so Android elevation has an opaque surface. */}
      <Animated.View style={anim}>
        {className || style ? (
          <View className={className} style={style}>
            {children}
          </View>
        ) : (
          children
        )}
      </Animated.View>
    </Pressable>
  );
}
