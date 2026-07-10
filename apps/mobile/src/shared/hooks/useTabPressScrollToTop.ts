import { useNavigation } from 'expo-router';
import { useEffect, useRef } from 'react';

/**
 * Re-pressing the active tab scrolls its list back to the top (the standard
 * big-app behavior). Built on expo-router's own navigation object so it shares
 * the router's context (a separate @react-navigation/native copy would not).
 */
export function useTabPressScrollToTop(scrollToTop: () => void) {
  const navigation = useNavigation();
  const cb = useRef(scrollToTop);
  cb.current = scrollToTop;

  useEffect(() => {
    // 'tabPress' is emitted by the bottom-tabs navigator hosting this screen.
    const nav = navigation as unknown as {
      addListener: (type: string, fn: () => void) => () => void;
      isFocused: () => boolean;
    };
    const unsub = nav.addListener('tabPress', () => {
      if (nav.isFocused()) cb.current();
    });
    return unsub;
  }, [navigation]);
}
