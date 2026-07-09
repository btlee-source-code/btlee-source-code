import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronLeft, Heart, Home, LogIn, LogOut, User } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function ProfileTab() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator color="#1A3C34" />
      </SafeAreaView>
    );
  }

  // Guest
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center px-10 gap-4">
          <View className="h-20 w-20 rounded-full bg-secondary items-center justify-center">
            <User size={34} color="#1A3C34" />
          </View>
          <Text className="text-lg font-cairo-bold text-foreground text-center">{S.profileGuestTitle}</Text>
          <Text className="text-sm text-muted-foreground font-cairo text-center">{S.profileGuestDesc}</Text>
          <Pressable
            onPress={() => router.push('/login')}
            className="mt-1 bg-primary rounded-xl px-6 py-3 flex-row items-center gap-2 active:opacity-90">
            <LogIn size={18} color="#FFFFFF" />
            <Text className="text-primary-foreground font-cairo-semibold">{S.signInTitle}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-4 gap-6">
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
          <MenuRow icon={<Heart size={20} color="#1A3C34" />} label={S.tabWishlist} onPress={() => router.push('/wishlist')} />
          <View className="h-px bg-border" />
          <MenuRow icon={<Home size={20} color="#1A3C34" />} label="إعلاناتي" onPress={() => {}} muted />
        </View>

        {/* Logout */}
        <Pressable
          onPress={logout}
          className="flex-row items-center justify-center gap-2 border border-destructive/30 rounded-xl h-12 active:opacity-80">
          <LogOut size={18} color="#DC2626" />
          <Text className="text-destructive font-cairo-semibold">{S.logout}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  muted?: boolean;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3.5 active:bg-secondary">
      <ChevronLeft size={18} color="#737373" />
      <View className="flex-1" />
      <Text className={`font-cairo-medium ${muted ? 'text-muted-foreground' : 'text-foreground'} mr-3`}>
        {label}
        {muted ? `  (${S.comingSoon})` : ''}
      </Text>
      {icon}
    </Pressable>
  );
}
