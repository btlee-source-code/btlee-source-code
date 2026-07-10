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
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { THEME_COLORS } from '@/config/theme';
import { AnimatedSplash } from '@/shared/components/layout/AnimatedSplash';
import { AppProviders } from '@/shared/components/providers/AppProviders';
import { useAppSelector } from '@/shared/store/hooks';

SplashScreen.preventAutoHideAsync();

/**
 * Root navigator — registers the three route groups ((tabs), (auth), (main)),
 * mirroring the web's group-based `app/` layout. Keyed by locale so a language
 * switch remounts the tree and every screen re-reads the localized strings.
 */
function RootNavigator() {
  const locale = useAppSelector((s) => s.locale.locale);
  const mode = useAppSelector((s) => s.theme.mode);

  return (
    <Stack
      key={locale}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: THEME_COLORS[mode].background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

/** Root wrapper — themed background + a status bar that matches the scheme. */
function ThemedRoot() {
  const mode = useAppSelector((s) => s.theme.mode);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </View>
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

  // The animated intro overlays the app until its fade-out completes.
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AppProviders>
      <ThemedRoot />
      {!introDone && <AnimatedSplash onFinish={() => setIntroDone(true)} />}
    </AppProviders>
  );
}
