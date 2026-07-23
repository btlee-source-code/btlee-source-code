import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { OnboardingSheet } from '@/features/account/components/OnboardingSheet';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { Logo } from '@/shared/components/layout/Logo';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Matches the OAuth deep link so Android never falls through to Expo Router's
 * "Unmatched Route" page. It also completes sign-in when the app was cold and
 * no login screen is waiting for openAuthSessionAsync.
 */
export default function OAuthCallbackRoute() {
  const params = useLocalSearchParams<{
    status?: string | string[];
    code?: string | string[];
    reason?: string | string[];
    accessToken?: string | string[];
    refreshToken?: string | string[];
    onboarding?: string | string[];
  }>();
  const router = useRouter();
  const c = useThemeColors();
  const { completeGoogleSignIn } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const callbackUrl = useMemo(() => {
    const query = new URLSearchParams();
    const status = first(params.status);
    const code = first(params.code);
    const reason = first(params.reason);
    const accessToken = first(params.accessToken);
    const refreshToken = first(params.refreshToken);
    const onboarding = first(params.onboarding);
    if (status) query.set('status', status);
    if (code) query.set('code', code);
    if (reason) query.set('reason', reason);
    if (accessToken) query.set('accessToken', accessToken);
    if (refreshToken) query.set('refreshToken', refreshToken);
    if (onboarding) query.set('onboarding', onboarding);
    return `btlee://oauth?${query.toString()}`;
  }, [
    params.accessToken,
    params.code,
    params.onboarding,
    params.reason,
    params.refreshToken,
    params.status,
  ]);

  useEffect(() => {
    // Expo Router normally provides the deep-link params on the first render,
    // but waiting for status also covers a cold-start hydration race.
    if (started.current || !first(params.status)) return;
    started.current = true;

    void completeGoogleSignIn(callbackUrl)
      .then(({ isNewUser }) => {
        if (isNewUser) setShowOnboarding(true);
        else router.replace('/');
      })
      .catch(() => setError(true));
  }, [callbackUrl, completeGoogleSignIn, params.status, router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8 gap-6">
        <View className="rounded-[32px] bg-card border border-border px-10 py-8">
          <Logo height={38} />
        </View>

        {error ? (
          <>
            <CircleAlert size={38} color={c.destructive} />
            <Text className="font-cairo-semibold text-base text-destructive text-center">
              {S.googleSignInFailed}
            </Text>
            <Pressable
              onPress={() => router.replace('/login')}
              className="h-12 min-w-36 px-6 rounded-full bg-primary items-center justify-center">
              <Text className="font-cairo-semibold text-primary-foreground">{S.back}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={c.primary} />
            <Text className="font-cairo-medium text-base text-foreground text-center">
              {S.loading}
            </Text>
          </>
        )}
      </View>

      <OnboardingSheet
        visible={showOnboarding}
        onComplete={() => router.replace('/')}
      />
    </SafeAreaView>
  );
}
