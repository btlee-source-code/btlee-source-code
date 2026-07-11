import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';

import { CarCard } from '@/features/cars/components/CarCard';
import { RailArrows } from '@/shared/components/ui/RailArrows';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { SkeletonPropertyCard } from '@/shared/components/ui/Skeleton';
import { useFetch } from '@/shared/hooks/useFetch';
import type { Car } from '@/shared/types/car';

/**
 * A titled horizontal carousel of cars for the cars home (featured / latest /
 * sale / rent). Mirrors PropertySection: hidden when empty, card width tracks
 * the screen, floating edge arrows, skeletons while loading; bump `refreshToken`
 * to refetch. "View all" opens the search tab (which renders the cars list when
 * the cars section is active).
 */
export function CarSection({
  title,
  fetcher,
  cacheKey,
  refreshToken = 0,
  viewAllParams,
}: {
  title: string;
  fetcher: () => Promise<Car[]>;
  cacheKey: string;
  refreshToken?: number;
  viewAllParams?: Record<string, string>;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data, isLoading, refetch } = useFetch(fetcher, cacheKey);
  const items = data ?? [];
  const cardWidth = Math.min(300, Math.round(width * 0.74));
  const step = cardWidth + 14;

  useEffect(() => {
    if (refreshToken > 0) refetch();
  }, [refreshToken, refetch]);

  const listRef = useRef<FlatList<Car>>(null);
  const offsetX = useRef(0);
  const stepList = (dir: 1 | -1) =>
    listRef.current?.scrollToOffset({ offset: Math.max(0, offsetX.current + dir * step), animated: true });

  if (!isLoading && items.length === 0) return null;

  return (
    <View className="gap-4">
      <SectionHeader
        title={title}
        onViewAll={() => router.push({ pathname: '/properties', params: viewAllParams ?? {} })}
      />

      {isLoading ? (
        <View className="flex-row gap-3.5 px-5 overflow-hidden">
          <View style={{ width: cardWidth }}>
            <SkeletonPropertyCard />
          </View>
          <View style={{ width: cardWidth }}>
            <SkeletonPropertyCard />
          </View>
        </View>
      ) : (
        <View>
          <FlatList
            ref={listRef}
            horizontal
            data={items}
            keyExtractor={(car) => car._id}
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => (offsetX.current = e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={32}
            snapToInterval={step}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            renderItem={({ item }) => (
              <View style={{ width: cardWidth }}>
                <CarCard car={item} />
              </View>
            )}
          />
          <RailArrows top={(cardWidth * 0.75) / 2 - 18} onStep={stepList} />
        </View>
      )}
    </View>
  );
}
