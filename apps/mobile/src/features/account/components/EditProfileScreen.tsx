import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { HttpError } from '@/shared/api/httpClient';
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';
import { TextField } from '@/shared/components/ui/TextField';
import { accountApi } from '../api/account.api';

/** Edit profile — only the name is editable (matches web); email/phone are read-only. */
export function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const c = useThemeColors();

  if (!user) return null;

  const onSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 60) {
      setError(S.nameInvalid);
      return;
    }
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      const updated = await accountApi.updateMe({ name: trimmed });
      setUser(updated);
      setOk(true);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : S.genericError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ResponsivePage size="compact">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="px-6 pt-2 pb-8" keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ArrowRight size={24} color={c.primary} />
            </Pressable>
            <Text className="text-lg font-cairo-bold text-foreground">{S.editProfileTitle}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Avatar */}
          <View className="items-center mb-6">
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: 88, height: 88, borderRadius: 44 }} contentFit="cover" />
            ) : (
              <View className="rounded-full bg-primary items-center justify-center" style={{ width: 88, height: 88 }}>
                <Text className="text-primary-foreground text-3xl font-cairo-bold">{user.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          <View className="gap-4">
            <TextField
              label={S.nameLabel}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setOk(false);
              }}
              error={error}
            />

            {/* Read-only contact (a user has exactly one of email/phone) */}
            <View className="gap-1.5">
              <Text className="text-sm font-cairo-medium text-foreground text-right">
                {user.email ? S.emailLabel : S.phoneLabel}
              </Text>
              <View className="bg-secondary/60 rounded-xl px-4 h-12 justify-center">
                <Text className="text-muted-foreground font-cairo text-right">{user.email ?? user.phone ?? ''}</Text>
              </View>
            </View>

            {ok ? (
              <View className="bg-primary/10 rounded-lg px-3 py-2">
                <Text className="text-primary text-sm font-cairo text-right">{S.saveSuccess}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSave}
              disabled={saving}
              className="bg-primary rounded-xl h-12 items-center justify-center active:opacity-90 mt-1">
              {saving ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <Text className="text-primary-foreground font-cairo-bold text-base">{S.saveChanges}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </ResponsivePage>
    </SafeAreaView>
  );
}
