import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowUpDown, Bookmark, CircleAlert, Search, SearchX, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { carsApi, type CarQuery } from '@/features/cars/api/cars.api';
import { CarCard } from '@/features/cars/components/CarCard';
import { CarSearchModal, type CarFilters, type CarSort } from '@/features/cars/list/CarSearchModal';
import { CarSaveSearchSheet } from '@/features/saved-searches/components/CarSaveSearchSheet';
import {
  CAR_BODY_TYPE_LABELS,
  CAR_CONDITION_LABELS,
  CAR_FUEL_TYPE_LABELS,
  CAR_TRANSMISSION_LABELS,
} from '@/features/cars/lib/carConstants';
import { SortSheet } from '@/features/properties/list/SortSheet';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { ResponsivePage } from '@/shared/components/layout/ResponsivePage';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { SkeletonPropertyCard } from '@/shared/components/ui/Skeleton';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { useTabPressScrollToTop } from '@/shared/hooks/useTabPressScrollToTop';
import { LISTING_TYPE_LABELS, SORT_OPTIONS } from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import { shadows } from '@/shared/lib/shadows';
import type { Car, CarBodyType, CarCondition, CarFuelType, CarListingType, CarTransmission } from '@/shared/types/car';

const LIMIT = 12;

/** Build the removable chips shown under the search bar from the active car filters. */
function chipsFromFilters(f: CarFilters): { key: keyof CarFilters; label: string }[] {
  const chips: { key: keyof CarFilters; label: string }[] = [];
  if (f.listingType) chips.push({ key: 'listingType', label: LISTING_TYPE_LABELS[f.listingType as CarListingType] });
  if (f.condition) chips.push({ key: 'condition', label: CAR_CONDITION_LABELS[f.condition as CarCondition] });
  if (f.bodyType) chips.push({ key: 'bodyType', label: CAR_BODY_TYPE_LABELS[f.bodyType as CarBodyType] });
  if (f.fuelType) chips.push({ key: 'fuelType', label: CAR_FUEL_TYPE_LABELS[f.fuelType as CarFuelType] });
  if (f.transmission) chips.push({ key: 'transmission', label: CAR_TRANSMISSION_LABELS[f.transmission as CarTransmission] });
  if (f.governorate) chips.push({ key: 'governorate', label: f.governorate });
  if (f.minYear) chips.push({ key: 'minYear', label: `${S.fMinYear} ${f.minYear}` });
  if (f.maxYear) chips.push({ key: 'maxYear', label: `${S.fMaxYear} ${f.maxYear}` });
  if (f.minPrice) chips.push({ key: 'minPrice', label: S.chipMinPrice(formatPrice(f.minPrice)) });
  if (f.maxPrice) chips.push({ key: 'maxPrice', label: S.chipMaxPrice(formatPrice(f.maxPrice)) });
  if (f.maxMileage) chips.push({ key: 'maxMileage', label: `${f.maxMileage} ${S.kmUnit}` });
  return chips;
}

/**
 * Cars list — paginated search over /api/cars, with the full search + filter +
 * sort sheet (CarSearchModal), matching the properties experience. Reads incoming
 * filters from the cars-home taps (bodyType / listingType / make) and opens the
 * sheet directly when navigated with `openSearch=1`.
 */
export function CarsScreen() {
  const params = useLocalSearchParams<{
    bodyType?: string;
    listingType?: string;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    governorate?: string;
    minYear?: string;
    maxYear?: string;
    minPrice?: string;
    maxPrice?: string;
    maxMileage?: string;
    make?: string;
    search?: string;
    openSearch?: string;
  }>();
  const router = useRouter();
  const c = useThemeColors();
  const { isAuthenticated } = useAuth();
  const { listColumns } = useResponsiveLayout();
  const cardSlotWidth = listColumns === 3 ? '31.8%' : listColumns === 2 ? '48.8%' : '100%';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<CarFilters>({});
  const [sort, setSort] = useState<CarSort>('newest');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showSave, setShowSave] = useState(false);

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

  // Apply incoming filters from navigation (cars home taps / applied saved search).
  useEffect(() => {
    const num = (v?: string) => {
      const n = Number(v);
      return v && Number.isFinite(n) ? n : undefined;
    };
    const p: CarFilters = {};
    if (params.bodyType) p.bodyType = params.bodyType;
    if (params.listingType) p.listingType = params.listingType;
    if (params.condition) p.condition = params.condition;
    if (params.fuelType) p.fuelType = params.fuelType;
    if (params.transmission) p.transmission = params.transmission;
    if (params.governorate) p.governorate = params.governorate;
    const minY = num(params.minYear);
    if (minY != null) p.minYear = minY;
    const maxY = num(params.maxYear);
    if (maxY != null) p.maxYear = maxY;
    const minP = num(params.minPrice);
    if (minP != null) p.minPrice = minP;
    const maxP = num(params.maxPrice);
    if (maxP != null) p.maxPrice = maxP;
    const maxM = num(params.maxMileage);
    if (maxM != null) p.maxMileage = maxM;
    if (Object.keys(p).length) setFilters((f) => ({ ...f, ...p }));
    if (params.search) setSearch(params.search);
    else if (params.make) setSearch(params.make);
    if (params.openSearch === '1') setSearchOpen(true);
  }, [
    params.bodyType,
    params.listingType,
    params.condition,
    params.fuelType,
    params.transmission,
    params.governorate,
    params.minYear,
    params.maxYear,
    params.minPrice,
    params.maxPrice,
    params.maxMileage,
    params.make,
    params.search,
    params.openSearch,
  ]);

  const onSaveSearch = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setShowSave(true);
  };

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      const id = ++reqId.current;
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const query: CarQuery = {
        page: nextPage,
        limit: LIMIT,
        sort,
        search: search || undefined,
        ...filters,
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
    [search, sort, filters]
  );

  useEffect(() => {
    load(1, true);
  }, [load]);

  const canLoadMore = items.length < total;
  const onEndReached = () => {
    if (!isLoading && !isLoadingMore && canLoadMore) load(page + 1, false);
  };

  const chips = useMemo(() => chipsFromFilters(filters), [filters]);
  const activeCount = chips.length;
  const removeFilter = (key: keyof CarFilters) => setFilters((f) => ({ ...f, [key]: undefined }));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ResponsivePage size="wide">
      {/* Search bar (opens the unified search + filter sheet) + save */}
      <View className="px-5 pt-3 pb-2">
        <View className="flex-row items-center gap-2.5">
          <Pressable
            onPress={() => setSearchOpen(true)}
            className="flex-1 flex-row items-center gap-2.5 bg-card border border-border rounded-full px-4 h-[50px] active:opacity-90"
            style={shadows.sm}>
            {activeCount > 0 ? (
              <View className="bg-primary rounded-full min-w-5 h-5 items-center justify-center px-1">
                <Text className="text-primary-foreground text-[11px] font-cairo-bold">{activeCount}</Text>
              </View>
            ) : null}
            <Text
              className={`flex-1 font-cairo-medium text-sm text-right ${search ? 'text-foreground' : 'text-muted-foreground'}`}
              numberOfLines={1}>
              {search || S.carsSearchPlaceholder}
            </Text>
            <Search size={20} color={c.muted} strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={onSaveSearch}
            className="items-center justify-center rounded-full border border-border bg-card w-[50px] h-[50px] active:opacity-80"
            style={shadows.sm}>
            <Bookmark size={19} color={c.foreground} />
          </Pressable>
        </View>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-2.5">
            {chips.map((chip) => (
              <Pressable
                key={chip.key}
                onPress={() => removeFilter(chip.key)}
                className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 active:opacity-70">
                <X size={13} color={c.primary} />
                <Text className="text-primary font-cairo-semibold text-xs">{chip.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <FlatList
        key={listColumns}
        ref={listRef}
        data={items}
        numColumns={listColumns}
        columnWrapperStyle={listColumns > 1 ? { gap: 16 } : undefined}
        keyExtractor={(car) => car._id}
        renderItem={({ item }) => (
          <View style={{ width: cardSlotWidth }}>
            <CarCard car={item} />
          </View>
        )}
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
          <View className="flex-row items-center justify-between pt-1 pb-3.5">
            {/* Sort shortcut (left) */}
            <PressableScale
              haptic
              onPress={() => setShowSort(true)}
              className="flex-row items-center gap-1.5 rounded-full border border-border bg-card h-9 pl-3.5 pr-3"
              style={shadows.sm}>
              <ArrowUpDown size={14} color={c.foreground} />
              <Text className="text-[13px] font-cairo-semibold text-foreground">
                {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? S.sortLabel}
              </Text>
            </PressableScale>
            {/* Result count (right) */}
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

      <CarSearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        initial={{ search, filters, sort }}
        onApply={({ search: s, filters: f, sort: so }) => {
          setSearch(s);
          setFilters(f);
          setSort(so);
        }}
      />
      <SortSheet visible={showSort} value={sort} onSelect={setSort} onClose={() => setShowSort(false)} />
      <CarSaveSearchSheet visible={showSave} onClose={() => setShowSave(false)} filters={filters} search={search} />
      </ResponsivePage>
    </SafeAreaView>
  );
}
