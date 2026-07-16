import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { blurPlaceholder } from '@/shared/lib/images';
import type { PropertyImage } from '@/shared/types/property';

const THUMB = 54; // thumbnail square
const THUMB_GAP = 8;

/**
 * Full-screen gallery viewer: swipe horizontally between photos, pinch or
 * double-tap to zoom, swipe down (when not zoomed) to dismiss. A thumbnail
 * filmstrip at the bottom jumps to any photo, prominent side arrows step through
 * them, and a pill counter tracks position.
 */
export function ImageViewer({
  images,
  initialIndex,
  visible,
  onClose,
}: {
  images: PropertyImage[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [index, setIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<PropertyImage>>(null);
  const thumbRef = useRef<FlatList<PropertyImage>>(null);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  // Keep the active thumbnail centered in the filmstrip.
  useEffect(() => {
    if (visible && images.length > 1) {
      const t = setTimeout(() => {
        thumbRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }, 60);
      return () => clearTimeout(t);
    }
  }, [index, visible, images.length]);

  if (!visible) return null;

  const goTo = (i: number) => {
    const next = Math.min(images.length - 1, Math.max(0, i));
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const multi = images.length > 1;

  return (
    <Modal visible transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={images}
          keyExtractor={(img) => img.publicId}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => <ZoomablePage uri={item.url} onDismiss={onClose} />}
        />

        {/* Prev/next arrows — prominent, high-contrast, vertically centered.
            Hidden at the edges. */}
        {multi && index > 0 && (
          <Arrow side="left" onPress={() => goTo(index - 1)}>
            <ChevronLeft size={30} color="#FFFFFF" strokeWidth={2.4} />
          </Arrow>
        )}
        {multi && index < images.length - 1 && (
          <Arrow side="right" onPress={() => goTo(index + 1)}>
            <ChevronRight size={30} color="#FFFFFF" strokeWidth={2.4} />
          </Arrow>
        )}

        {/* Top bar: counter (RTL start = right) + close */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8 }}>
          <View className="rounded-full px-3.5 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <Text className="text-white text-[13px] font-cairo-semibold">
              {index + 1} / {images.length}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-11 w-11 rounded-full items-center justify-center active:opacity-60"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' }}>
            <X size={22} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Bottom thumbnail filmstrip */}
        {multi && (
          <Animated.View
            entering={FadeIn.duration(220)}
            className="absolute left-0 right-0"
            style={{ bottom: insets.bottom + 14 }}>
            <FlatList
              ref={thumbRef}
              horizontal
              data={images}
              keyExtractor={(img) => `t-${img.publicId}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: THUMB_GAP }}
              getItemLayout={(_, i) => ({ length: THUMB + THUMB_GAP, offset: (THUMB + THUMB_GAP) * i, index: i })}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item, index: i }) => {
                const active = i === index;
                return (
                  <Pressable onPress={() => goTo(i)} className="active:opacity-80">
                    <View
                      style={{
                        width: THUMB,
                        height: THUMB,
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: active ? 2.5 : 1,
                        borderColor: active ? c.accent : 'rgba(255,255,255,0.22)',
                        opacity: active ? 1 : 0.55,
                      }}>
                      <Image
                        source={{ uri: item.url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={120}
                      />
                    </View>
                  </Pressable>
                );
              }}
            />
          </Animated.View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

/** A prominent, high-contrast circular arrow control at the screen edge. */
function Arrow({
  side,
  onPress,
  children,
}: {
  side: 'left' | 'right';
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      className="absolute h-12 w-12 rounded-full items-center justify-center active:opacity-60"
      style={{
        [side]: 12,
        top: '50%',
        marginTop: -24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
      }}>
      {children}
    </Pressable>
  );
}

/** One zoomable photo page. */
function ZoomablePage({ uri, onDismiss }: { uri: string; onDismiss: () => void }) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const dismissY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(4, Math.max(1, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1.15) scale.value = withSpring(1, { damping: 16 });
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(scale.value > 1.5 ? 1 : 2.4, { damping: 15 });
    });

  // Vertical drag dismiss — only meaningful when not zoomed.
  const pan = Gesture.Pan()
    .activeOffsetY([-14, 14])
    .failOffsetX([-12, 12])
    .onUpdate((e) => {
      if (scale.value <= 1.1) dismissY.value = e.translationY;
    })
    .onEnd((e) => {
      if (scale.value <= 1.1 && (Math.abs(dismissY.value) > 110 || Math.abs(e.velocityY) > 900)) {
        dismissY.value = withTiming(dismissY.value > 0 ? height : -height, { duration: 180 }, (done) => {
          if (done) runOnJS(onDismiss)();
        });
      } else {
        dismissY.value = withSpring(0, { damping: 16 });
      }
    });

  const composed = Gesture.Simultaneous(pinch, Gesture.Exclusive(doubleTap, pan));

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: dismissY.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[{ width, height, justifyContent: 'center' }, style]}>
        <Image
          source={{ uri }}
          placeholder={blurPlaceholder(uri) ? { uri: blurPlaceholder(uri) } : undefined}
          style={{ width, height: width }}
          contentFit="contain"
          transition={200}
        />
      </Animated.View>
    </GestureDetector>
  );
}
