import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  SlideInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Native-feeling bottom sheet: springs up from the bottom, has a grabber
 * handle, and can be dragged down (from the grabber/title zone) to dismiss.
 * Tapping the backdrop also closes it.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const isTablet = width >= 600;
  const dragY = useSharedValue(0);

  // Fresh position every time the sheet opens.
  useEffect(() => {
    if (visible) dragY.value = 0;
  }, [visible, dragY]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (dragY.value > 130 || e.velocityY > 900) {
        dragY.value = withTiming(700, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dragY.value }] }));

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(160)}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Sheet */}
        <Animated.View
          entering={SlideInDown.springify().damping(19).stiffness(220)}
          style={[
            sheetStyle,
            {
              width: '100%',
              maxWidth: 680,
              alignSelf: 'center',
              marginBottom: isTablet ? Math.max(insets.bottom, 20) : 0,
            },
          ]}>
          <View
            className="bg-background rounded-t-[28px] px-5"
            style={{
              maxHeight: Math.max(280, height - insets.top - 12),
              paddingBottom: insets.bottom + 16,
              flexShrink: 1,
              borderRadius: isTablet ? 28 : undefined,
            }}>
            <GestureDetector gesture={pan}>
              {/* Grab zone — drag here to dismiss */}
              <View className="items-center pt-3 pb-2">
                <View className="h-1.5 w-11 rounded-full bg-border" />
                {title ? (
                  <Text
                    numberOfLines={2}
                    maxFontSizeMultiplier={1.2}
                    className="text-base font-cairo-bold text-foreground text-center mt-3">
                    {title}
                  </Text>
                ) : null}
              </View>
            </GestureDetector>
            <ScrollView
              style={{ flexShrink: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
