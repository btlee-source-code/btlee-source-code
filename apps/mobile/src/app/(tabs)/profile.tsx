import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Bell,
  Bookmark,
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
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LanguageSwitcher } from '@/features/i18n/components/LanguageSwitcher';
import { ThemeToggle } from '@/features/theme/components/ThemeToggle';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useAppSelector } from '@/shared/store/hooks';

export default function ProfileTab() {
  const router = useRouter();
  const c = useThemeColors();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

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
        <View className="flex-1 items-center justify-center px-10 gap-4">
          <View className="h-20 w-20 rounded-full bg-secondary items-center justify-center">
            <User size={34} color={c.primary} />
          </View>
          <Text className="text-lg font-cairo-bold text-foreground text-center">{S.profileGuestTitle}</Text>
          <Text className="text-sm text-muted-foreground font-cairo text-center">{S.profileGuestDesc}</Text>
          <Pressable
            onPress={() => router.push('/login')}
            className="mt-1 bg-primary rounded-xl px-6 py-3 flex-row items-center gap-2 active:opacity-90">
            <LogIn size={18} color={c.primaryForeground} />
            <Text className="text-primary-foreground font-cairo-semibold">{S.signInTitle}</Text>
          </Pressable>
        </View>
        <View className="px-5 pb-2 gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
        </View>
        <LegalLinks />
      </SafeAreaView>
    );
  }

  // Authenticated
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-4 pb-6 gap-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center gap-3 pt-4">
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: 88, height: 88, borderRadius: 44 }} contentFit="cover" />
          ) : (
            <View className="h-22 w-22 rounded-full bg-primary items-center justify-center" style={{ width: 88, height: 88 }}>
              <Text className="text-primary-foreground text-3xl font-cairo-bold">{user.name.charAt(0)}</Text>
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
          <MenuRow icon={<Home size={20} color={c.primary} />} label={S.myPropertiesTitle} onPress={() => router.push('/my-properties')} />
          <View className="h-px bg-border" />
          <MenuRow icon={<Plus size={20} color={c.primary} />} label={S.addNew} onPress={() => router.push('/add-property')} />
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
          onPress={logout}
          className="flex-row items-center justify-center gap-2 border border-destructive/30 rounded-xl h-12 active:opacity-80">
          <LogOut size={18} color={c.destructive} />
          <Text className="text-destructive font-cairo-semibold">{S.logout}</Text>
        </Pressable>
      </ScrollView>
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
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3.5 active:bg-secondary">
      <ChevronLeft size={18} color={c.muted} />
      {badge && badge > 0 ? (
        <View className="ml-2 h-5 rounded-full bg-accent items-center justify-center px-1.5" style={{ minWidth: 20 }}>
          <Text className="text-[11px] font-cairo-bold text-accent-foreground">{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
      <View className="flex-1" />
      <Text className={`font-cairo-medium ${muted ? 'text-muted-foreground' : 'text-foreground'} mr-3`}>
        {label}
        {muted ? `  (${S.comingSoon})` : ''}
      </Text>
      {icon}
    </Pressable>
  );
}
