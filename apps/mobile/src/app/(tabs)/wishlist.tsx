import { useRouter } from 'expo-router';
import { Heart, LogIn } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';
import { useFetch } from '@/shared/hooks/useFetch';
import { useAppSelector } from '@/shared/store/hooks';

export default function WishlistTab() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const ids = useAppSelector((s) => s.wishlist.ids);

  // Re-fetch whenever the saved set changes; skip the call entirely for guests.
  const { data, isLoading: loading } = useFetch(
    () => (isAuthenticated ? wishlistApi.get() : Promise.resolve([])),
    isAuthenticated ? ids.join(',') : 'guest'
  );
  const c = useThemeColors();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center px-10 gap-4">
          <View className="h-20 w-20 rounded-full bg-secondary items-center justify-center">
            <Heart size={34} color={c.accent} />
          </View>
          <Text className="text-lg font-cairo-bold text-foreground text-center">{S.wishlistEmptyTitle}</Text>
          <Text className="text-sm text-muted-foreground font-cairo text-center">{S.wishlistEmptyDesc}</Text>
          <Pressable
            onPress={() => router.push('/login')}
            className="mt-1 bg-primary rounded-xl px-6 py-3 flex-row items-center gap-2 active:opacity-90">
            <LogIn size={18} color={c.primaryForeground} />
            <Text className="text-primary-foreground font-cairo-semibold">{S.signInTitle}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Filter by the live id set so removals disappear instantly (optimistic).
  const items = (data ?? []).filter((p) => ids.includes(p._id));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Text className="text-xl font-cairo-bold text-foreground text-right px-4 pt-3 pb-2">{S.tabWishlist}</Text>
      <FlatList
        data={items}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-20">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : (
            <View className="items-center py-20 gap-2">
              <View className="h-16 w-16 rounded-full bg-secondary items-center justify-center mb-1">
                <Heart size={28} color={c.accent} />
              </View>
              <Text className="text-lg font-cairo-bold text-foreground">{S.wishlistEmptyTitle}</Text>
              <Text className="text-sm text-muted-foreground font-cairo">{S.wishlistEmptyDesc}</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
