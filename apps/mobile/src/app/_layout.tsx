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
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="properties/[id]"
          options={{ headerShown: true, headerTitle: '', headerBackTitle: 'رجوع', headerTintColor: '#1A3C34' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
