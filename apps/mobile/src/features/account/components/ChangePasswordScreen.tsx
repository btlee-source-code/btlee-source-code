import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { TextField } from '@/shared/components/ui/TextField';
import { accountApi } from '../api/account.api';

type Errors = Partial<Record<'current' | 'next' | 'form', string>>;

export function ChangePasswordScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const c = useThemeColors();

  const onSave = async () => {
    const e: Errors = {};
    if (!current) e.current = S.required;
    if (next.length < 8) e.next = S.passwordMin;
    else if (!/[a-zA-Z]/.test(next)) e.next = S.passwordLetter;
    else if (!/[0-9]/.test(next)) e.next = S.passwordDigit;
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await accountApi.changePassword(current, next);
      // The endpoint revokes all sessions and returns fresh tokens as cookies
      // only, so the mobile token is now dead — force a clean re-login.
      Alert.alert(S.passwordChangedTitle, S.passwordChangedReLogin, [
        {
          text: S.signInTitle,
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]);
    } catch {
      // Web shows the same catch-all message for any failure.
      setErrors({ form: S.currentPasswordWrong });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-2 pb-8" keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ArrowRight size={24} color={c.primary} />
            </Pressable>
            <Text className="text-lg font-cairo-bold text-foreground">{S.changePasswordTitle}</Text>
            <View style={{ width: 24 }} />
          </View>

          <View className="gap-4">
            <TextField
              label={S.currentPasswordLabel}
              value={current}
              onChangeText={setCurrent}
              error={errors.current}
              secureTextEntry
              autoCapitalize="none"
            />
            <TextField
              label={S.newPasswordLabel}
              value={next}
              onChangeText={setNext}
              error={errors.next}
              secureTextEntry
              autoCapitalize="none"
            />

            {errors.form ? (
              <View className="bg-destructive/10 rounded-lg px-3 py-2">
                <Text className="text-destructive text-sm font-cairo text-right">{errors.form}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSave}
              disabled={saving}
              className="bg-primary rounded-xl h-12 items-center justify-center active:opacity-90 mt-1">
              {saving ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <Text className="text-primary-foreground font-cairo-bold text-base">{S.changePasswordTitle}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
