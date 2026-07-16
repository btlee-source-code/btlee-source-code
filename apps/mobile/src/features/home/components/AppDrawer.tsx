import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Bell,
  Bookmark,
  Car,
  ChevronLeft,
  Heart,
  Home,
  LogIn,
  MessageCircle,
  Plus,
  User,
  X,
} from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LanguageSwitcher } from '@/features/i18n/components/LanguageSwitcher';
import { useSection } from '@/features/section/hooks/useSection';
import { SectionSwitcher } from '@/features/section/components/SectionSwitcher';
import { ThemeToggle } from '@/features/theme/components/ThemeToggle';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useAppSelector } from '@/shared/store/hooks';

/** WhatsApp contact (support). Matches the number on the legal pages. */
const SUPPORT_WHATSAPP = '201070010209';

/**
 * Sleek slide-in navigation drawer (opens from the right, RTL-natural). Groups
 * the quick actions that used to crowd the header — add listing, section switch,
 * notifications, saved lists, appearance, language, support — behind the
 * hamburger, so the header stays clean (theme · logo · menu).
 */
export function AppDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = useThemeColors();
  const { isCars } = useSection();
  const { user, isAuthenticated } = useAuth();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  const panelW = Math.min(340, width * 0.86);
  const tx = useSharedValue(panelW); // off-screen (to the right) when closed
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      tx.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      tx.value = withTiming(panelW, { duration: 220, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: 1 - tx.value / panelW }));

  if (!mounted) return null;

  // Navigate then close — the drawer animates out as the destination pushes in.
  const go = (path: string) => {
    onClose();
    router.push(path as never);
  };

  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
        {/* Backdrop */}
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' }, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        {/* Panel */}
        <Animated.View
          style={[
            {
              width: panelW,
              height: '100%',
              backgroundColor: c.background,
              borderTopLeftRadius: 26,
              borderBottomLeftRadius: 26,
              paddingTop: insets.top + 12,
              shadowColor: '#000',
              shadowOffset: { width: -4, height: 0 },
              shadowOpacity: 0.18,
              shadowRadius: 20,
              elevation: 24,
            },
            panelStyle,
          ]}>
          {/* Header: identity + close */}
          <View className="px-5 flex-row items-center justify-between">
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 rounded-full bg-secondary items-center justify-center active:opacity-70">
              <X size={18} color={c.foreground} />
            </Pressable>
            <Text className="text-base font-cairo-bold text-foreground">{S.menuTitle}</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}>
            {/* Identity card */}
            <Pressable
              onPress={() => go(isAuthenticated ? '/profile' : '/login')}
              className="flex-row items-center gap-3 bg-card border border-border rounded-2xl p-3 active:opacity-90">
              <View className="h-12 w-12 rounded-full bg-secondary items-center justify-center overflow-hidden">
                {isAuthenticated && user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <User size={24} color={c.muted} />
                )}
              </View>
              <View className="flex-1">
                {isAuthenticated && user ? (
                  <>
                    <Text className="font-cairo-bold text-foreground text-right" numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text className="text-xs font-cairo text-muted-foreground text-right">{S.viewProfile}</Text>
                  </>
                ) : (
                  <>
                    <Text className="font-cairo-bold text-foreground text-right">{S.profileGuestTitle}</Text>
                    <Text className="text-xs font-cairo text-muted-foreground text-right">{S.signInTitle}</Text>
                  </>
                )}
              </View>
              {!isAuthenticated && <LogIn size={18} color={c.primary} />}
            </Pressable>

            {/* Add listing — primary action */}
            <Pressable
              onPress={() => go(isCars ? '/add-car' : '/add-property')}
              className="flex-row items-center justify-center gap-2 bg-primary rounded-2xl h-12 active:opacity-90">
              <Plus size={20} color={c.primaryForeground} strokeWidth={2.4} />
              <Text className="font-cairo-bold text-primary-foreground text-[15px]">{S.addNew}</Text>
            </Pressable>

            {/* Section switch */}
            <SectionSwitcher />

            {/* Quick links */}
            <View className="bg-card border border-border rounded-2xl overflow-hidden">
              <DrawerRow icon={<Bell size={20} color={c.primary} />} label={S.notificationsTitle} badge={unreadCount} onPress={() => go('/notifications')} />
              <Divider />
              <DrawerRow icon={<Heart size={20} color={c.primary} />} label={S.tabWishlist} onPress={() => go('/wishlist')} />
              <Divider />
              <DrawerRow icon={<Bookmark size={20} color={c.primary} />} label={S.savedSearchesTitle} onPress={() => go('/saved-searches')} />
              <Divider />
              <DrawerRow
                icon={isCars ? <Car size={20} color={c.primary} /> : <Home size={20} color={c.primary} />}
                label={isCars ? S.myCarsTitle : S.myPropertiesTitle}
                onPress={() => go(isCars ? '/my-cars' : '/my-properties')}
              />
            </View>

            {/* Appearance + language (reused controls) */}
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Support */}
            <Pressable
              onPress={() => Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP}`)}
              className="flex-row items-center gap-3 bg-card border border-border rounded-2xl p-4 active:opacity-90">
              <ChevronLeft size={17} color={c.muted} />
              <View className="flex-1" />
              <Text className="font-cairo-medium text-foreground mr-1">{S.contactUs}</Text>
              <MessageCircle size={20} color={c.primary} />
            </Pressable>

            {/* Legal footer */}
            <View className="flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
              {[
                { label: S.privacyTitle, path: '/legal/privacy' },
                { label: S.disclaimerTitle, path: '/legal/disclaimer' },
                { label: S.dataDeletionTitle, path: '/legal/data-deletion' },
              ].map((l) => (
                <Pressable key={l.path} onPress={() => go(l.path)} hitSlop={6}>
                  <Text className="text-xs text-muted-foreground font-cairo underline">{l.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Divider() {
  return <View className="h-px bg-border" />;
}

function DrawerRow({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  const c = useThemeColors();
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3.5 active:bg-secondary">
      <ChevronLeft size={17} color={c.muted} />
      {badge && badge > 0 ? (
        <View className="ml-2 h-5 rounded-full bg-accent items-center justify-center px-1.5" style={{ minWidth: 20 }}>
          <Text className="text-[11px] font-cairo-bold text-accent-foreground">{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
      <View className="flex-1" />
      <Text className="font-cairo-medium text-foreground mr-3">{label}</Text>
      {icon}
    </Pressable>
  );
}
