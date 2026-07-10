import { Stack } from 'expo-router';

import { S } from '@/config/strings';

/**
 * Main app group — everything reached from the tabs that isn't itself a tab:
 * property detail, owner profile, add/my listings, account, saved searches,
 * notifications, and the legal pages. Mirrors the web's `app/[locale]/(main)`.
 * Screens not listed here use the default (headerless) options.
 */
export default function MainLayout() {
  const nativeHeader = {
    headerShown: true,
    headerTitle: '',
    headerBackTitle: S.back,
    headerTintColor: '#1A3C34',
  } as const;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="properties/[id]" options={nativeHeader} />
      <Stack.Screen name="owners/[id]" options={nativeHeader} />
      <Stack.Screen name="legal/privacy" options={nativeHeader} />
      <Stack.Screen name="legal/disclaimer" options={nativeHeader} />
      <Stack.Screen name="legal/data-deletion" options={nativeHeader} />
    </Stack>
  );
}
