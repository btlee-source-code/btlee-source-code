import { Moon, Sun } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { NotificationsBell } from '@/features/notifications/components/NotificationsBell';
import { SectionSwitcher } from '@/features/section/components/SectionSwitcher';
import { useTheme, useThemeColors } from '@/features/theme/hooks/useTheme';
import { Logo } from '@/shared/components/layout/Logo';

/**
 * Shared home header: the section-branded wordmark + quiet utility controls
 * (theme toggle, notifications), with the section switcher underneath. Used by
 * both the properties and cars home screens so the switch point is identical.
 */
export function HomeTopBar() {
  const c = useThemeColors();
  const { isDark, toggle } = useTheme();

  return (
    <View className="px-5 pt-3 gap-3">
      <View className="flex-row items-center justify-between">
        <Logo height={34} />
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={toggle}
            hitSlop={6}
            className="h-10 w-10 rounded-full border border-border bg-card items-center justify-center active:opacity-70">
            {isDark ? <Sun size={18} color={c.foreground} /> : <Moon size={18} color={c.foreground} />}
          </Pressable>
          <NotificationsBell />
        </View>
      </View>
      <SectionSwitcher />
    </View>
  );
}
