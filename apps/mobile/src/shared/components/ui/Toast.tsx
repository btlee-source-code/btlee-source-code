import { Check, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadows } from '@/shared/lib/shadows';

type ToastPayload = { id: number; message: string; type: 'success' | 'error' };

let seq = 0;
let emit: ((t: ToastPayload) => void) | null = null;

/** Global toast API — call from anywhere; the host renders it. */
export const toast = {
  success: (message: string) => emit?.({ id: ++seq, message, type: 'success' }),
  error: (message: string) => emit?.({ id: ++seq, message, type: 'error' }),
};

const AUTO_DISMISS_MS = 2400;

/**
 * Renders the active toast as an inverted pill (foreground bg) that springs up
 * from the bottom, above the tab bar. Mounted once in AppProviders.
 */
export function ToastHost() {
  const [current, setCurrent] = useState<ToastPayload | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    emit = (t) => {
      setCurrent(t);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCurrent(null), AUTO_DISMISS_MS);
    };
    return () => {
      emit = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!current) return null;

  const success = current.type === 'success';
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: insets.top + 10,
        alignItems: 'center',
        paddingHorizontal: 16,
      }}>
      <Animated.View
        key={current.id}
        entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
        exiting={FadeOutUp.duration(200).easing(Easing.in(Easing.cubic))}
        style={{ maxWidth: '100%' }}>
        <View
          className="flex-row items-center gap-2.5 bg-foreground rounded-3xl pl-5 pr-2.5 py-2.5"
          style={[shadows.lg, { maxWidth: '100%', minHeight: 48 }]}>
          <Text
            className="flex-shrink text-background font-cairo-semibold text-[13px] text-right"
            maxFontSizeMultiplier={1.2}>
            {current.message}
          </Text>
          <View
            className="h-7 w-7 rounded-full items-center justify-center"
            style={{ backgroundColor: success ? '#FDB803' : '#DC2626', flexShrink: 0 }}>
            {success ? <Check size={14} color="#1C1C1C" strokeWidth={3} /> : <X size={14} color="#FFFFFF" strokeWidth={3} />}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
