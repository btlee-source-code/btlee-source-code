import { useState } from 'react';
import { Text } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useWhileActive } from '@/shared/hooks/useWhileActive';

/**
 * A single-line hint that cycles through example searches, each rolling up and
 * fading in — the "alive" search-bar feel big apps use to seed ideas.
 */
export function AnimatedSearchHint({
  prefix,
  examples,
  className,
  intervalMs = 2600,
}: {
  prefix: string;
  examples: string[];
  className?: string;
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Foreground only: a background tick would animate props nobody can see, and
  // JS timers keep firing after the app is backgrounded (see useWhileActive).
  useWhileActive(() => {
    if (examples.length < 2) return;
    const bump = () => setI((p) => (p + 1) % examples.length);
    const id = setInterval(() => {
      // Old text drops + fades out, then the next one rolls in from the top.
      opacity.value = withTiming(0, { duration: 220 });
      translateY.value = withTiming(6, { duration: 220 }, (finished) => {
        if (!finished) return;
        runOnJS(bump)();
        translateY.value = -6;
        translateY.value = withTiming(0, { duration: 260 });
        opacity.value = withTiming(1, { duration: 260 });
      });
    }, intervalMs);
    return () => {
      clearInterval(id);
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      opacity.value = 1;
      translateY.value = 0;
    };
  }, [examples.length, intervalMs, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={style}>
      <Text numberOfLines={1} className={className}>
        {prefix}
        {examples[i]}
      </Text>
    </Animated.View>
  );
}
