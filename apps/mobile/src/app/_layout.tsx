import '../global.css';

import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  useFonts,
} from '@expo-google-fonts/cairo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { I18nProvider } from '@/features/i18n/components/I18nProvider';
import { NotificationsProvider } from '@/features/notifications/components/NotificationsProvider';
import { WishlistProvider } from '@/features/wishlist/components/WishlistProvider';
import { store } from '@/shared/store';
import { useAppSelector } from '@/shared/store/hooks';

SplashScreen.preventAutoHideAsync();

/**
 * Root navigator — registers the three route groups ((tabs), (auth), (main)),
 * mirroring the web's group-based `app/` layout. Each group owns its own
 * screen options in its `_layout.tsx`. Keyed by locale so a language switch
 * remounts the tree and every screen re-reads the localized strings.
 */
function RootNavigator() {
  const locale = useAppSelector((s) => s.locale.locale);

  return (
    <Stack key={locale} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

export default function RootLayout() {
  // Load the brand font (Cairo) in the weights the UI uses.
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <AuthProvider>
        <WishlistProvider>
          <NotificationsProvider>
            <I18nProvider>
              <SafeAreaProvider>
                <StatusBar style="dark" />
                <RootNavigator />
              </SafeAreaProvider>
            </I18nProvider>
          </NotificationsProvider>
        </WishlistProvider>
      </AuthProvider>
    </Provider>
  );
}
