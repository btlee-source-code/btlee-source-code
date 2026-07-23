import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Bell,
  Bookmark,
  Car,
  ChevronLeft,
  Heart,
  Home,
  KeyRound,
  LogIn,
  LogOut,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LanguageSwitcher } from '@/features/i18n/components/LanguageSwitcher';
import { useSection } from '@/features/section/hooks/useSection';
import { ThemeToggle } from '@/features/theme/components/ThemeToggle';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';
import { toast } from '@/shared/components/ui/Toast';
import { useAppSelector } from '@/shared/store/hooks';

export default function ProfileTab() {
  const router = useRouter();
  const c = useThemeColors();
  const { user, isAuthenticated, isLoading, logout, deleteAccount } = useAuth();
  const { isCars } = useSection();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const [deleting, setDeleting] = useState(false);

  // Two-step confirm before the irreversible account wipe, then drop to home
  // as a guest. Errors surface without leaving the user in a broken state.
  const confirmDeleteAccount = () => {
    Alert.alert(S.deleteAccount, S.deleteAccountConfirm, [
      { text: S.cancel, style: 'cancel' },
      {
        text: S.deleteAccountCta,
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteAccount();
            router.replace('/');
          } catch {
            setDeleting(false);
            Alert.alert(S.errorTitle, S.genericError);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  // Guest
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ResponsivePage size="compact">
          <View className="flex-1 items-center justify-center px-10 gap-3">
            <User size={40} color={c.muted} strokeWidth={1.4} />
            <Text className="text-lg font-cairo-bold text-foreground text-center mt-2">{S.profileGuestTitle}</Text>
            <Text className="text-sm text-muted-foreground font-cairo text-center">{S.profileGuestDesc}</Text>
            <Pressable
              onPress={() => router.push('/login')}
              className="mt-2 bg-primary rounded-full h-12 px-8 flex-row items-center gap-2 active:opacity-90">
              <LogIn size={18} color={c.primaryForeground} />
              <Text className="text-primary-foreground font-cairo-semibold">{S.signInTitle}</Text>
            </Pressable>
          </View>
          <View className="px-5 pb-2 gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </View>
          <LegalLinks />
        </ResponsivePage>
      </SafeAreaView>
    );
  }

  // Authenticated
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ResponsivePage size="compact">
        <ScrollView contentContainerClassName="px-5 pt-4 pb-6 gap-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center gap-3 pt-4">
          {user.avatar ? (
            <View className="rounded-full border-2 border-border p-1">
              <Image source={{ uri: user.avatar }} style={{ width: 84, height: 84, borderRadius: 42 }} contentFit="cover" />
            </View>
          ) : (
            <View className="rounded-full border-2 border-border p-1">
              <View className="rounded-full bg-primary items-center justify-center" style={{ width: 84, height: 84 }}>
                <Text className="text-primary-foreground text-3xl font-cairo-bold">{user.name.charAt(0)}</Text>
              </View>
            </View>
          )}
          <View className="items-center">
            <Text className="text-xl font-cairo-bold text-foreground">{user.name}</Text>
            {user.email ? <Text className="text-sm text-muted-foreground font-cairo">{user.email}</Text> : null}
            {user.phone ? <Text className="text-sm text-muted-foreground font-cairo">{user.phone}</Text> : null}
          </View>
        </View>

        {/* Menu */}
        <View className="bg-card border border-border rounded-xl overflow-hidden">
          {isCars ? (
            <MenuRow icon={<Car size={20} color={c.primary} />} label={S.myCarsTitle} onPress={() => router.push('/my-cars')} />
          ) : (
            <MenuRow icon={<Home size={20} color={c.primary} />} label={S.myPropertiesTitle} onPress={() => router.push('/my-properties')} />
          )}
          <View className="h-px bg-border" />
          <MenuRow
            icon={<Plus size={20} color={c.primary} />}
            label={S.addNew}
            onPress={() => router.push(isCars ? '/add-car' : '/add-property')}
          />
          <View className="h-px bg-border" />
          <MenuRow
            icon={<Bell size={20} color={c.primary} />}
            label={S.notificationsTitle}
            badge={unreadCount}
            onPress={() => router.push('/notifications')}
          />
          <View className="h-px bg-border" />
          <MenuRow icon={<Heart size={20} color={c.primary} />} label={S.tabWishlist} onPress={() => router.push('/wishlist')} />
          <View className="h-px bg-border" />
          <MenuRow icon={<Bookmark size={20} color={c.primary} />} label={S.savedSearchesTitle} onPress={() => router.push('/saved-searches')} />
        </View>

        {/* Account settings */}
        <View className="bg-card border border-border rounded-xl overflow-hidden">
          <MenuRow icon={<User size={20} color={c.primary} />} label={S.editProfileTitle} onPress={() => router.push('/account/edit')} />
          <View className="h-px bg-border" />
          <MenuRow
            icon={<KeyRound size={20} color={c.primary} />}
            label={S.changePasswordTitle}
            onPress={() => router.push('/account/change-password')}
          />
        </View>

        {/* Appearance + language */}
        <ThemeToggle />
        <LanguageSwitcher />

        {/* About / legal */}
        <View className="bg-card border border-border rounded-xl overflow-hidden">
          <MenuRow icon={<ShieldCheck size={20} color={c.primary} />} label={S.privacyTitle} onPress={() => router.push('/legal/privacy')} />
          <View className="h-px bg-border" />
          <MenuRow icon={<ShieldAlert size={20} color={c.primary} />} label={S.disclaimerTitle} onPress={() => router.push('/legal/disclaimer')} />
          <View className="h-px bg-border" />
          <MenuRow icon={<Trash2 size={20} color={c.primary} />} label={S.dataDeletionTitle} onPress={() => router.push('/legal/data-deletion')} />
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => {
            logout();
            toast.success(S.toastLogoutSuccess);
          }}
          className="flex-row items-center justify-center gap-2 border border-destructive/30 rounded-full h-[50px] active:opacity-80">
          <LogOut size={18} color={c.destructive} />
          <Text className="text-destructive font-cairo-semibold">{S.logout}</Text>
        </Pressable>

        {/* Delete account (app-store requirement — matches the data-deletion page) */}
        <Pressable
          onPress={confirmDeleteAccount}
          disabled={deleting}
          className="flex-row items-center justify-center gap-2 h-11 -mt-2 active:opacity-70">
          {deleting ? (
            <ActivityIndicator size="small" color={c.destructive} />
          ) : (
            <>
              <Trash2 size={16} color={c.destructive} />
              <Text className="text-destructive/90 font-cairo-medium text-sm">{S.deleteAccount}</Text>
            </>
          )}
        </Pressable>
        </ScrollView>
      </ResponsivePage>
    </SafeAreaView>
  );
}

function LegalLinks() {
  const router = useRouter();
  const links = [
    { label: S.privacyTitle, path: '/legal/privacy' as const },
    { label: S.disclaimerTitle, path: '/legal/disclaimer' as const },
    { label: S.dataDeletionTitle, path: '/legal/data-deletion' as const },
  ];
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-x-5 gap-y-1 px-6 pb-4">
      {links.map((l) => (
        <Pressable key={l.path} onPress={() => router.push(l.path)} hitSlop={6}>
          <Text className="text-xs text-muted-foreground font-cairo underline">{l.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  muted,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  muted?: boolean;
  badge?: number;
}) {
  const c = useThemeColors();
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-4 active:bg-secondary">
      <ChevronLeft size={17} color={c.muted} />
      {badge && badge > 0 ? (
        <View className="ml-2 h-5 rounded-full bg-accent items-center justify-center px-1.5" style={{ minWidth: 20 }}>
          <Text className="text-[11px] font-cairo-bold text-accent-foreground">{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
      <View className="flex-1" />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        className={`flex-shrink font-cairo-medium ${muted ? 'text-muted-foreground' : 'text-foreground'} mr-3`}>
        {label}
        {muted ? `  (${S.comingSoon})` : ''}
      </Text>
      {icon}
    </Pressable>
  );
}
