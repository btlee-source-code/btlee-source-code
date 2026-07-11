import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlert, Plus, Search, SearchX, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { carsApi, type CarQuery } from '@/features/cars/api/cars.api';
import { CarCard } from '@/features/cars/components/CarCard';
import { CAR_BODY_TYPE_LABELS } from '@/features/cars/lib/carConstants';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { SkeletonPropertyCard } from '@/shared/components/ui/Skeleton';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { LISTING_TYPE_LABELS } from '@/shared/lib/constants';
import { shadows } from '@/shared/lib/shadows';
import type { Car, CarBodyType, CarListingType } from '@/shared/types/car';

const LIMIT = 12;

/**
 * Cars list — a clean paginated search over /api/cars. Reads incoming filters
 * (bodyType / listingType from the cars home taps) and offers a simple make/model
 * text search. Kept intentionally lean; richer filters/sort are a later
 * iteration (the visual pass will build on this scaffold).
 */
export function CarsScreen() {
  const params = useLocalSearchParams<{ bodyType?: string; listingType?: string; make?: string }>();
  const router = useRouter();
  const c = useThemeColors();

  const [search, setSearch] = useState('');
  const [bodyType, setBodyType] = useState<string | undefined>();
  const [listingType, setListingType] = useState<string | undefined>();

  const [items, setItems] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  const listRef = useRef<FlatList<Car>>(null);
  useTabPressScrollToTop(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));

  // Apply incoming filters from navigation (cars home taps).
  useEffect(() => {
    if (params.bodyType) setBodyType(params.bodyType);
    if (params.listingType) setListingType(params.listingType);
    if (params.make) setSearch(params.make);
  }, [params.bodyType, params.listingType, params.make]);

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      const id = ++reqId.current;
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const query: CarQuery = {
        page: nextPage,
        limit: LIMIT,
        search: search || undefined,
        bodyType,
        listingType,
      };

      try {
        const { data, meta } = await carsApi.list(query);
        if (id !== reqId.current) return;
        setTotal(meta?.pagination?.total ?? 0);
        setItems((prev) => (replace ? data : [...prev, ...data]));
        setPage(nextPage);
      } catch (e) {
        if (id !== reqId.current) return;
        setError(e instanceof Error ? e.message : S.carsErrorDesc);
      } finally {
        if (id === reqId.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [search, bodyType, listingType]
  );

  useEffect(() => {
    load(1, true);
  }, [load]);

  const canLoadMore = items.length < total;
  const onEndReached = () => {
    if (!isLoading && !isLoadingMore && canLoadMore) load(page + 1, false);
  };

  const activeChips = [
    bodyType ? { key: 'bodyType' as const, label: CAR_BODY_TYPE_LABELS[bodyType as CarBodyType] } : null,
    listingType ? { key: 'listingType' as const, label: LISTING_TYPE_LABELS[listingType as CarListingType] } : null,
  ].filter(Boolean) as { key: 'bodyType' | 'listingType'; label: string }[];

  const clearChip = (key: 'bodyType' | 'listingType') => {
    if (key === 'bodyType') setBodyType(undefined);
    else setListingType(undefined);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Search bar (make / model) */}
      <View className="px-5 pt-3 pb-2 gap-2.5">
        <View
          className="flex-row items-center gap-2.5 bg-card border border-border rounded-full px-4 h-[50px]"
          style={shadows.sm}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => load(1, true)}
            returnKeyType="search"
            placeholder={S.carsSearchPlaceholder}
            placeholderTextColor={c.muted}
            className="flex-1 font-cairo-medium text-sm text-foreground text-right"
          />
          <Pressable onPress={() => load(1, true)} hitSlop={8}>
            <Search size={20} color={c.muted} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {activeChips.map((chip) => (
              <Pressable
                key={chip.key}
                onPress={() => clearChip(chip.key)}
                className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 active:opacity-70">
                <X size={13} color={c.primary} />
                <Text className="text-primary font-cairo-semibold text-xs">{chip.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(car) => car._id}
        renderItem={({ item }) => <CarCard car={item} />}
        contentContainerClassName="px-5 pb-28 gap-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load(1, true);
              setRefreshing(false);
            }}
            tintColor={c.primary}
            colors={[c.primary]}
            progressBackgroundColor={c.card}
          />
        }
        ListHeaderComponent={
          <View className="flex-row items-center justify-end pt-1 pb-3.5">
            <Text className="text-sm font-cairo-semibold text-foreground">
              {isLoading ? S.loading : S.carsResultsCount(total)}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-6">
              <SkeletonPropertyCard />
              <SkeletonPropertyCard />
              <SkeletonPropertyCard />
            </View>
          ) : error ? (
            <EmptyState
              icon={CircleAlert}
              title={S.errorTitle}
              description={S.carsErrorDesc}
              actionLabel={S.retry}
              onAction={() => load(1, true)}
            />
          ) : (
            <EmptyState icon={SearchX} title={S.noResultsTitle} description={S.noResultsDesc} />
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : null
        }
      />

      {/* Add-car FAB — extended (icon + label), mirrors the properties list */}
      <PressableScale
        haptic
        onPress={() => router.push('/add-car')}
        containerClassName="absolute bottom-5 left-5"
        className="flex-row items-center gap-2 h-14 rounded-full bg-primary pl-4 pr-5"
        style={shadows.lg}>
        <Plus size={22} color={c.primaryForeground} strokeWidth={2.8} />
        <Text className="text-primary-foreground font-cairo-bold text-[15px]">{S.addCarTitle}</Text>
      </PressableScale>
    </SafeAreaView>
  );
}
