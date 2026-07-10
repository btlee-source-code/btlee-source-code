import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { HttpError } from '@/shared/api/httpClient';
import { Logo } from '@/shared/components/layout/Logo';
import { authApi } from '../api/auth.api';

/**
 * Set a new password from a reset link. The token arrives via the URL/deep link
 * (`btlee://reset-password?token=...`) and is read with useLocalSearchParams.
 * A successful reset revokes all sessions server-side, so we route to /login
 * (no auto-login).
 */
export function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    if (password.length < 8) return setError(S.passwordMin);
    if (!/[a-zA-Z]/.test(password)) return setError(S.passwordLetter);
    if (!/[0-9]/.test(password)) return setError(S.passwordDigit);
    if (password !== confirm) return setError(S.passwordNoMatch);
    setSubmitting(true);
    setError(null);
    try {
      await authApi.resetPassword(token!, password);
      setDone(true);
      setTimeout(() => router.replace('/login'), 1500);
    } catch (e) {
      setError(e instanceof HttpError && e.status === 429 ? S.tooManyAttempts : S.resetInvalidToken);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-2 pb-8 flex-grow" keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.replace('/login')} hitSlop={8} className="h-10 w-10 items-start justify-center">
            <ArrowRight size={24} color="#1A3C34" />
          </Pressable>
          <View className="items-center mt-4 mb-8">
            <Logo height={38} />
          </View>

          {!token ? (
            <View className="items-center gap-3 mt-6">
              <AlertTriangle size={56} color="#D97706" />
              <Text className="text-lg font-cairo-bold text-foreground text-center">{S.resetInvalidToken}</Text>
              <Pressable
                onPress={() => router.replace('/forgot-password')}
                className="bg-primary rounded-xl px-6 py-3 mt-2 active:opacity-90">
                <Text className="text-primary-foreground font-cairo-semibold">{S.resetPasswordTitle}</Text>
              </Pressable>
            </View>
          ) : done ? (
            <View className="items-center gap-3 mt-6">
              <CheckCircle2 size={56} color="#059669" />
              <Text className="text-lg font-cairo-bold text-foreground text-center">{S.resetSuccess}</Text>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-cairo-bold text-foreground text-right">{S.newPasswordTitle}</Text>
              <Text className="text-sm text-muted-foreground font-cairo text-right mb-6">{S.newPasswordSubtitle}</Text>
              <View className="gap-4">
                {/* New password (with show/hide) */}
                <View className="gap-1.5">
                  <Text className="text-sm font-cairo-medium text-foreground text-right">{S.newPasswordLabel}</Text>
                  <View className="flex-row items-center bg-secondary rounded-xl px-4 h-12">
                    <Pressable onPress={() => setShow((v) => !v)} hitSlop={8}>
                      {show ? <EyeOff size={20} color="#737373" /> : <Eye size={20} color="#737373" />}
                    </Pressable>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!show}
                      autoCapitalize="none"
                      textAlign="right"
                      className="flex-1 ml-2 text-foreground font-cairo text-right"
                    />
                  </View>
                </View>

                {/* Confirm password */}
                <View className="gap-1.5">
                  <Text className="text-sm font-cairo-medium text-foreground text-right">{S.confirmPasswordLabel}</Text>
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    textAlign="right"
                    className="bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right"
                  />
                </View>

                {error ? (
                  <View className="bg-destructive/10 rounded-lg px-3 py-2">
                    <Text className="text-destructive text-sm font-cairo text-right">{error}</Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={onSubmit}
                  disabled={submitting}
                  className="bg-primary rounded-xl h-12 items-center justify-center active:opacity-90 mt-1">
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-primary-foreground font-cairo-bold text-base">{S.setNewPassword}</Text>
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
