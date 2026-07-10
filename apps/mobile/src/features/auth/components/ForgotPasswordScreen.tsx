import { useRouter } from 'expo-router';
import { ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { Logo } from '@/shared/components/layout/Logo';
import { TextField } from '@/shared/components/ui/TextField';
import { authApi } from '../api/auth.api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Request a password-reset link. The server always returns 200 (never reveals
 * whether the email exists), so success just shows a generic "check your inbox".
 */
export function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const c = useThemeColors();

  const onSubmit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError(S.invalidEmail);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await authApi.forgotPassword(email.trim());
      setDone(true);
    } catch (e) {
      setError(e instanceof HttpError && e.status === 429 ? S.tooManyAttempts : S.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-2 pb-8 flex-grow" keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={8} className="h-10 w-10 items-start justify-center">
            <ArrowRight size={24} color={c.primary} />
          </Pressable>
          <View className="items-center mt-4 mb-8">
            <Logo height={38} />
          </View>

          {done ? (
            <View className="items-center gap-3 mt-6">
              <CheckCircle2 size={56} color="#059669" />
              <Text className="text-xl font-cairo-bold text-foreground text-center">{S.resetLinkSent}</Text>
              <Text className="text-sm text-muted-foreground font-cairo text-center">{S.resetLinkSentDesc}</Text>
              <Pressable
                onPress={() => router.replace('/login')}
                className="bg-primary rounded-xl px-6 py-3 mt-2 active:opacity-90">
                <Text className="text-primary-foreground font-cairo-semibold">{S.backToLogin}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-cairo-bold text-foreground text-right">{S.resetPasswordTitle}</Text>
              <Text className="text-sm text-muted-foreground font-cairo text-right mb-6">{S.resetPasswordDesc}</Text>
              <View className="gap-4">
                <TextField
                  label={S.emailLabel}
                  value={email}
                  onChangeText={setEmail}
                  error={error}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Pressable
                  onPress={onSubmit}
                  disabled={submitting}
                  className="bg-primary rounded-xl h-12 items-center justify-center active:opacity-90 mt-1">
                  {submitting ? (
                    <ActivityIndicator color={c.primaryForeground} />
                  ) : (
                    <Text className="text-primary-foreground font-cairo-bold text-base">{S.sendResetLink}</Text>
                  )}
                </Pressable>
                <Pressable onPress={() => router.replace('/login')} hitSlop={8} className="items-center mt-2">
                  <Text className="text-primary font-cairo-semibold text-sm">{S.backToLogin}</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
