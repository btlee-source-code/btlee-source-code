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
import { WishlistProvider } from '@/features/wishlist/components/WishlistProvider';
import { store } from '@/shared/store';

SplashScreen.preventAutoHideAsync();

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
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="properties/[id]"
              options={{ headerShown: true, headerTitle: '', headerBackTitle: 'رجوع', headerTintColor: '#1A3C34' }}
            />
            <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="register" options={{ animation: 'slide_from_bottom' }} />
          </Stack>
        </SafeAreaProvider>
        </WishlistProvider>
      </AuthProvider>
    </Provider>
  );
}
