import { useCallback, useRef } from 'react';
import {
  Keyboard,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type View,
} from 'react-native';

/**
 * Measures fields by their screen position, so scrolling remains correct even
 * when a field is nested inside a responsive row.
 */
export function useFormErrorScroll<Key extends string>() {
  const scrollRef = useRef<ScrollView>(null);
  const fieldRefs = useRef<Partial<Record<Key, View | null>>>({});
  const scrollOffset = useRef(0);

  const setFieldRef = useCallback((key: Key, node: View | null) => {
    fieldRefs.current[key] = node;
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }, []);

  const scrollToFirstError = useCallback(
    (errors: Partial<Record<Key, string>>, order: readonly Key[]) => {
      const firstKey = order.find((key) => Boolean(errors[key]));
      if (!firstKey) return;

      Keyboard.dismiss();

      // Wait for the inline error message to be rendered before measuring.
      requestAnimationFrame(() => {
        const target = fieldRefs.current[firstKey];
        const scroll = scrollRef.current;
        if (!target || !scroll) return;
        const nativeScroll = scroll.getNativeScrollRef();
        if (!nativeScroll) return;

        target.measure((_x, _y, _width, _height, _pageX, pageY) => {
          nativeScroll.measure((_sx, _sy, _sw, _sh, _scrollPageX, scrollPageY) => {
            const y = Math.max(0, scrollOffset.current + pageY - scrollPageY - 16);
            scroll.scrollTo({ y, animated: true });
          });
        });
      });
    },
    []
  );

  return { scrollRef, setFieldRef, handleScroll, scrollToFirstError };
}
