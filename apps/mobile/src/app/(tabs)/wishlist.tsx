import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CarCard } from '@/features/cars/components/CarCard';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { carWishlistApi } from '@/features/wishlist/api/carWishlist.api';
import { wishlistApi } from '@/features/wishlist/api/wishlist.api';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { SkeletonPropertyCard } from '@/shared/components/ui/Skeleton';
import { useFetch } from '@/shared/hooks/useFetch';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { useAppSelector } from '@/shared/store/hooks';
import type { Car } from '@/shared/types/car';
import type { Property } from '@/shared/types/property';

/**
 * Saved listings — section-aware: shows the saved cars when the cars section is
 * active, otherwise the saved properties. Each domain has its own id set + API.
 */
export default function WishlistTab() {
  const router = useRouter();
  const { isCars } = useSection();
  const { isAuthenticated, isLoading } = useAuth();
  const ids = useAppSelector((s) => (isCars ? s.wishlist.carIds : s.wishlist.ids));
  const [refreshing, setRefreshing] = useState(false);

  // Re-fetch whenever the saved set (or section) changes; skip entirely for guests.
  const { data, isLoading: loading, refetch } = useFetch(
    () =>
      isAuthenticated
        ? isCars
          ? carWishlistApi.get()
          : wishlistApi.get()
        : Promise.resolve<(Property | Car)[]>([]),
    `${isCars ? 'cars' : 'props'}:${isAuthenticated ? ids.join(',') : 'guest'}`
  );
  const c = useThemeColors();

  const listRef = useRef<FlatList<Property | Car>>(null);
  useTabPressScrollToTop(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));

  const Header = (
    <Text className="text-[22px] font-cairo-bold text-foreground text-right px-5 pt-4 pb-3">{S.tabWishlist}</Text>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {Header}
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
        {Header}
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
  const items = ((data ?? []) as (Property | Car)[]).filter((x) => ids.includes(x._id));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {Header}
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(x) => x._id}
        renderItem={({ item }) =>
          isCars ? <CarCard car={item as Car} /> : <PropertyCard property={item as Property} />
        }
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
            <EmptyState
              icon={Heart}
              title={isCars ? S.wishlistEmptyTitleCar : S.wishlistEmptyTitle}
              description={isCars ? S.wishlistEmptyDescCar : S.wishlistEmptyDesc}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
