import { useRouter } from 'expo-router';
import { ArrowRight, Eye, EyeOff } from 'lucide-react-native';
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
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import { TextField } from '@/shared/components/ui/TextField';
import { toast } from '@/shared/components/ui/Toast';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const c = useThemeColors();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!identifier.trim() || !password) {
      setError(S.required);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      toast.success(S.toastLoginSuccess);
      router.back(); // return to wherever the user came from (now authenticated)
    } catch (e) {
      const err = e as HttpError;
      const msg = err.status === 401 ? S.loginFailed : err.message || S.genericError;
      setError(msg);
      toast.error(S.toastLoginFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ResponsivePage size="compact">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-3 pb-8 flex-grow" keyboardShouldPersistTaps="handled">
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-10 w-10 rounded-full border border-border bg-card items-center justify-center active:bg-secondary">
            <ArrowRight size={20} color={c.foreground} />
          </Pressable>

          {/* Brand — logo on a soft blob with playful dots */}
          <View className="items-center mt-5 mb-7">
            <View className="px-8 py-6 rounded-[32px] bg-primary/5">
              <Logo height={36} />
            </View>
            <View className="absolute top-1 right-[26%] h-3 w-3 rounded-full bg-accent/60" />
            <View className="absolute bottom-0 left-[24%] h-2 w-2 rounded-full bg-primary/30" />
          </View>

          <Text className="text-[24px] font-cairo-bold text-foreground text-right">{S.signInTitle}</Text>
          <Text className="text-sm text-muted-foreground font-cairo text-right mb-6">{S.signInSubtitle}</Text>

          <GoogleSignInButton
            onSuccess={() => {
              toast.success(S.toastLoginSuccess);
              router.back();
            }}
          />

          <View className="gap-4">
            <TextField
              label={S.emailOrPhoneLabel}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="username"
            />

            <View className="gap-1.5">
              <Text className="text-sm font-cairo-medium text-foreground text-right">{S.passwordLabel}</Text>
              <View
                className={`flex-row items-center bg-card border rounded-2xl px-4 h-14 ${
                  pwFocused ? 'border-primary' : 'border-border'
                }`}>
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  {showPassword ? <EyeOff size={20} color={c.muted} /> : <Eye size={20} color={c.muted} />}
                </Pressable>
                <AppTextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholderTextColor={c.muted}
                  textAlign="right"
                  className="flex-1 ml-2 text-foreground font-cairo text-right"
                />
              </View>
              <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8} className="self-start">
                <Text className="text-primary font-cairo-medium text-xs">{S.forgotPassword}</Text>
              </Pressable>
            </View>

            {error ? (
              <View className="bg-destructive/10 rounded-xl px-3 py-2.5">
                <Text className="text-destructive text-sm font-cairo text-right">{error}</Text>
              </View>
            ) : null}

            <PressableScale
              haptic
              onPress={onSubmit}
              disabled={submitting}
              containerClassName="mt-1"
              className="bg-primary rounded-full h-14 items-center justify-center">
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-primary-foreground font-cairo-bold text-base">{S.signInBtn}</Text>
              )}
            </PressableScale>

            <View className="flex-row flex-wrap items-center justify-center gap-x-1 gap-y-0.5 mt-2">
              <Pressable onPress={() => router.replace('/register')} hitSlop={8}>
                <Text className="text-primary font-cairo-semibold text-sm">{S.createAccountBtn}</Text>
              </Pressable>
              <Text className="text-muted-foreground font-cairo text-sm">{S.noAccount}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </ResponsivePage>
    </SafeAreaView>
  );
}
