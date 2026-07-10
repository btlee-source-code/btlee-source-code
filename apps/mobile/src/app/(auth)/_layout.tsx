import { Stack } from 'expo-router';

import { useThemeColors } from '@/features/theme/hooks/useTheme';

/**
 * Auth flow group — login, register, forgot/reset password.
 * Mirrors the web's `app/[locale]/(auth)` group. Route groups don't affect URLs,
 * so `/login`, `/register`, etc. keep working unchanged.
 */
export default function AuthLayout() {
  const c = useThemeColors();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }} />;
}
