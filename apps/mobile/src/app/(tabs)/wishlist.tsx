import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SkeletonPropertyCard } from '@/shared/components/ui/Skeleton';
import { useFetch } from '@/shared/hooks/useFetch';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { useAppSelector } from '@/shared/store/hooks';
import type { Property } from '@/shared/types/property';

export default function WishlistTab() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const ids = useAppSelector((s) => s.wishlist.ids);
  const [refreshing, setRefreshing] = useState(false);

  // Re-fetch whenever the saved set changes; skip the call entirely for guests.
  const { data, isLoading: loading, refetch } = useFetch(
    () => (isAuthenticated ? wishlistApi.get() : Promise.resolve([])),
    isAuthenticated ? ids.join(',') : 'guest'
  );
  const c = useThemeColors();

  const listRef = useRef<FlatList<Property>>(null);
  useTabPressScrollToTop(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Text className="text-[22px] font-cairo-bold text-foreground text-right px-5 pt-4 pb-3">{S.tabWishlist}</Text>
        <View className="px-5 gap-6">
          <SkeletonPropertyCard />
          <SkeletonPropertyCard />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Text className="text-[22px] font-cairo-bold text-foreground text-right px-5 pt-4 pb-3">{S.tabWishlist}</Text>
        <View className="flex-1 justify-center pb-16">
          <EmptyState
            icon={Heart}
            title={S.wishlistEmptyTitle}
            description={S.wishlistEmptyDesc}
            actionLabel={S.signInTitle}
            onAction={() => router.push('/login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Filter by the live id set so removals disappear instantly (optimistic).
  const items = (data ?? []).filter((p) => ids.includes(p._id));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Text className="text-[22px] font-cairo-bold text-foreground text-right px-5 pt-4 pb-3">{S.tabWishlist}</Text>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerClassName="px-5 pb-8 gap-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refetch();
              setTimeout(() => setRefreshing(false), 800);
            }}
            tintColor={c.primary}
            colors={[c.primary]}
            progressBackgroundColor={c.card}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View className="gap-6">
              <SkeletonPropertyCard />
              <SkeletonPropertyCard />
            </View>
          ) : (
            <EmptyState icon={Heart} title={S.wishlistEmptyTitle} description={S.wishlistEmptyDesc} />
          )
        }
      />
    </SafeAreaView>
  );
}
