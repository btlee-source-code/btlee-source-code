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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { HttpError } from '@/shared/api/httpClient';
import { Logo } from '@/shared/components/layout/Logo';
import { TextField } from '@/shared/components/ui/TextField';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      router.back(); // return to wherever the user came from (now authenticated)
    } catch (e) {
      const err = e as HttpError;
      setError(err.status === 401 ? S.loginFailed : err.message || S.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-2 pb-8 flex-grow" keyboardShouldPersistTaps="handled">
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={8} className="h-10 w-10 items-start justify-center">
            <ArrowRight size={24} color="#1A3C34" />
          </Pressable>

          {/* Brand */}
          <View className="items-center mt-4 mb-8">
            <Logo height={38} />
          </View>

          <Text className="text-2xl font-cairo-bold text-foreground text-right">{S.signInTitle}</Text>
          <Text className="text-sm text-muted-foreground font-cairo text-right mb-6">{S.signInSubtitle}</Text>

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
              <View className="flex-row items-center bg-secondary rounded-xl px-4 h-12">
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  {showPassword ? <EyeOff size={20} color="#737373" /> : <Eye size={20} color="#737373" />}
                </Pressable>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#737373"
                  textAlign="right"
                  className="flex-1 ml-2 text-foreground font-cairo text-right"
                />
              </View>
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
                <Text className="text-primary-foreground font-cairo-bold text-base">{S.signInBtn}</Text>
              )}
            </Pressable>

            <View className="flex-row items-center justify-center gap-1 mt-2">
              <Pressable onPress={() => router.replace('/register')} hitSlop={8}>
                <Text className="text-primary font-cairo-semibold text-sm">{S.createAccountBtn}</Text>
              </Pressable>
              <Text className="text-muted-foreground font-cairo text-sm">{S.noAccount}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
