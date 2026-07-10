import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { blurPlaceholder } from '@/shared/lib/images';
import type { PropertyImage } from '@/shared/types/property';

/**
 * Full-screen gallery viewer: swipe horizontally between photos, pinch or
 * double-tap to zoom, swipe down (when not zoomed) to dismiss.
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
  const [index, setIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<PropertyImage>>(null);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  if (!visible) return null;

  const goTo = (i: number) => {
    const next = Math.min(images.length - 1, Math.max(0, i));
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

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

        {/* Prev/next arrows — the "this is a slider" affordance. Hidden at the
            edges; vertically centered. */}
        {images.length > 1 && index > 0 && (
          <Pressable
            onPress={() => goTo(index - 1)}
            hitSlop={8}
            className="absolute h-10 w-10 rounded-full items-center justify-center active:opacity-70"
            style={{ left: 14, top: '50%', marginTop: -20, backgroundColor: 'rgba(255,255,255,0.16)' }}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </Pressable>
        )}
        {images.length > 1 && index < images.length - 1 && (
          <Pressable
            onPress={() => goTo(index + 1)}
            hitSlop={8}
            className="absolute h-10 w-10 rounded-full items-center justify-center active:opacity-70"
            style={{ right: 14, top: '50%', marginTop: -20, backgroundColor: 'rgba(255,255,255,0.16)' }}>
            <ChevronRight size={22} color="#FFFFFF" />
          </Pressable>
        )}

        {/* Top bar: close (RTL start = right) + counter */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 8 }}>
          <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <Text className="text-white text-xs font-cairo-semibold">
              {index + 1} / {images.length}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-10 w-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
            <X size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
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
