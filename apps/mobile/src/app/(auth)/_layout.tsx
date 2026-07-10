import { Stack } from 'expo-router';

/**
 * Auth flow group — login, register, forgot/reset password.
 * Mirrors the web's `app/[locale]/(auth)` group. Route groups don't affect URLs,
 * so `/login`, `/register`, etc. keep working unchanged.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }} />;
}
