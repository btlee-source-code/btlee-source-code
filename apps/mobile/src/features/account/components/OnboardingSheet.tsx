import { Eye, Home, KeyRound, ShoppingBag, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import type { UserGoal } from '@/shared/types/user';
import { accountApi } from '../api/account.api';

const GOALS: { key: UserGoal; label: string; Icon: LucideIcon }[] = [
  { key: 'buy', label: S.goalBuy, Icon: ShoppingBag },
  { key: 'rent', label: S.goalRent, Icon: KeyRound },
  { key: 'sell', label: S.goalSell, Icon: Home },
  { key: 'browse', label: S.goalBrowse, Icon: Eye },
];

/**
 * Post-registration goal dialog. Non-dismissible except via Skip/Continue
 * (matches web). Skip saves nothing; Continue persists the goal.
 */
export function OnboardingSheet({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
  const { setUser } = useAuth();
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [saving, setSaving] = useState(false);
  const c = useThemeColors();

  const onContinue = async () => {
    if (!goal) return;
    setSaving(true);
    try {
      const updated = await accountApi.completeOnboarding(goal);
      setUser(updated);
    } catch {
      // non-blocking — onboarding is best-effort
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <SafeAreaView className="flex-1 bg-black/50" edges={['top', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 16,
          }}>
          <View className="bg-background rounded-2xl p-5 gap-4 w-full">
          <View className="items-center gap-1">
            <Text className="text-xl font-cairo-bold text-foreground text-center">{S.onboardingTitle}</Text>
            <Text className="text-sm text-muted-foreground font-cairo text-center">{S.onboardingSubtitle}</Text>
          </View>

          <View className="flex-row flex-wrap gap-3 justify-between">
            {GOALS.map(({ key, label, Icon }) => {
              const selected = goal === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setGoal(key)}
                  className={`rounded-xl border p-4 items-center gap-2 active:opacity-90 ${
                    selected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  style={{ width: '47%' }}>
                  <View
                    className={`h-12 w-12 rounded-full items-center justify-center ${
                      selected ? 'bg-primary' : 'bg-secondary'
                    }`}>
                    <Icon size={22} color={selected ? c.primaryForeground : c.primary} />
                  </View>
                  <Text className={`font-cairo-semibold text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-3 mt-1">
            <Pressable
              onPress={onComplete}
              className="flex-1 rounded-xl h-12 items-center justify-center border border-border active:bg-secondary">
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className="font-cairo-semibold text-muted-foreground">
                {S.skip}
              </Text>
            </Pressable>
            <Pressable
              onPress={onContinue}
              disabled={!goal || saving}
              className={`flex-1 rounded-xl h-12 items-center justify-center ${goal ? 'bg-primary' : 'bg-primary/40'}`}>
              {saving ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  className="text-primary-foreground font-cairo-bold">
                  {S.continue}
                </Text>
              )}
            </Pressable>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
