import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';

import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { RailArrows } from '@/shared/components/ui/RailArrows';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { SkeletonPropertyCard } from '@/shared/components/ui/Skeleton';
import { useFetch } from '@/shared/hooks/useFetch';
import type { Property } from '@/shared/types/property';

/**
 * A titled horizontal carousel of properties for the home screen
 * (e.g. featured / latest). Hidden entirely when the section is empty.
 * Card width tracks the screen so one card plus a peek of the next is always
 * visible on any phone size; floating edge arrows signal that it scrolls.
 * While loading it shows skeleton cards; bump `refreshToken` to refetch.
 */

export function PropertySection({
  title,
  fetcher,
  cacheKey,
  refreshToken = 0,
  viewAllParams,
}: {
  title: string;
  fetcher: () => Promise<Property[]>;
  cacheKey: string;
  refreshToken?: number;
  /** Filters to carry into the list when "view all" is tapped. */
  viewAllParams?: Record<string, string>;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data, isLoading, refetch } = useFetch(fetcher, cacheKey);
  const items = data ?? [];
  const cardWidth = Math.min(300, Math.round(width * 0.74));
  const step = cardWidth + 14;

  // Parent pull-to-refresh bumps the token → refetch.
  useEffect(() => {
    if (refreshToken > 0) refetch();
  }, [refreshToken, refetch]);

  const listRef = useRef<FlatList<Property>>(null);
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
            keyExtractor={(p) => p._id}
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => (offsetX.current = e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={32}
            snapToInterval={step}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            renderItem={({ item }) => (
              <View style={{ width: cardWidth }}>
                <PropertyCard property={item} />
              </View>
            )}
          />
          {/* Centered on the card cover (4:3 → height = width * 0.75) */}
          <RailArrows top={(cardWidth * 0.75) / 2 - 18} onStep={stepList} />
        </View>
      )}
    </View>
  );
}
