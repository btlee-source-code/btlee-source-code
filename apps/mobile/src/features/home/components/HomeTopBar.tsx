import { Menu, Moon, Sun } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppDrawer } from '@/features/home/components/AppDrawer';
import { SectionSwitcher } from '@/features/section/components/SectionSwitcher';
import { useTheme, useThemeColors } from '@/features/theme/hooks/useTheme';
import { Logo } from '@/shared/components/layout/Logo';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Shared home header: theme toggle (left) · section-branded wordmark (centered) ·
 * menu (right). The menu opens the app drawer, which holds the quick actions
 * that used to crowd the header (add listing, notifications, saved lists, …).
 * The section switcher sits underneath. Used by both home screens so the switch
 * point is identical.
 */
export function HomeTopBar() {
  const c = useThemeColors();
  const { isDark, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  return (
    <View className="px-5 pt-3 gap-3">
      <View className="flex-row items-center justify-between pb-2">
        {/* Theme toggle — left */}
        <Pressable
          onPress={toggle}
          hitSlop={6}
          className="h-10 w-10 rounded-full border border-border bg-card items-center justify-center active:opacity-70">
          {isDark ? <Sun size={18} color={c.foreground} /> : <Moon size={18} color={c.foreground} />}
        </Pressable>

        {/* Logo — centered */}
        <View className="flex-1 items-center">
          <Logo height={49} />
        </View>

        {/* Menu — right (with an unread dot) */}
        <Pressable
          onPress={() => setDrawerOpen(true)}
          hitSlop={6}
          className="h-10 w-10 rounded-full border border-border bg-card items-center justify-center active:opacity-70">
          <Menu size={20} color={c.foreground} />
          {unreadCount > 0 ? (
            <View className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-background" />
          ) : null}
        </Pressable>
      </View>

      <SectionSwitcher />

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}
