import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, Plus, Search, SearchX, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SaveSearchSheet } from '@/features/saved-searches/components/SaveSearchSheet';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { CATEGORY_LABELS, FINISHING_LABELS, LISTING_TYPE_LABELS, TYPE_LABELS } from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import type { Property } from '@/shared/types/property';
import { propertiesApi, type PropertyQuery } from '../api/properties.api';
import { PropertyCard } from '../components/PropertyCard';
import type { Filters } from './PropertyFilters';
import { SearchModal } from './SearchModal';
import type { SortValue } from './SortSheet';

const LIMIT = 12;

/** Build the removable chips shown under the search bar from the active filters. */
function chipsFromFilters(f: Filters): { key: keyof Filters; label: string }[] {
  const chips: { key: keyof Filters; label: string }[] = [];
  if (f.listingType) chips.push({ key: 'listingType', label: LISTING_TYPE_LABELS[f.listingType as 'sale' | 'rent'] });
  if (f.type) chips.push({ key: 'type', label: TYPE_LABELS[f.type as keyof typeof TYPE_LABELS] });
  if (f.category) chips.push({ key: 'category', label: CATEGORY_LABELS[f.category as 'residential' | 'commercial'] });
  if (f.finishing) chips.push({ key: 'finishing', label: FINISHING_LABELS[f.finishing as keyof typeof FINISHING_LABELS] });
  if (f.governorate) chips.push({ key: 'governorate', label: f.governorate });
  if (f.minBedrooms) chips.push({ key: 'minBedrooms', label: S.chipMinBedrooms(f.minBedrooms) });
  if (f.minArea) chips.push({ key: 'minArea', label: S.chipMinArea(f.minArea) });
  if (f.minPrice) chips.push({ key: 'minPrice', label: S.chipMinPrice(formatPrice(f.minPrice)) });
  if (f.maxPrice) chips.push({ key: 'maxPrice', label: S.chipMaxPrice(formatPrice(f.maxPrice)) });
  return chips;
}

export function PropertiesScreen() {
  const params = useLocalSearchParams<{
    type?: string;
    listingType?: string;
    category?: string;
    governorate?: string;
    finishing?: string;
    minPrice?: string;
    maxPrice?: string;
    minBedrooms?: string;
    minArea?: string;
    search?: string;
    openSearch?: string;
  }>();
  const router = useRouter();
  const c = useThemeColors();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<SortValue>('newest');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSave, setShowSave] = useState(false);

  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // Apply incoming filters passed via navigation (home tap, applied saved search).
  useEffect(() => {
    const num = (v?: string) => {
      const n = Number(v);
      return v && Number.isFinite(n) ? n : undefined;
    };
    const p: Filters = {};
    if (params.type) p.type = params.type;
    if (params.listingType) p.listingType = params.listingType;
    if (params.category) p.category = params.category;
    if (params.governorate) p.governorate = params.governorate;
    if (params.finishing) p.finishing = params.finishing;
    const minP = num(params.minPrice);
    if (minP != null) p.minPrice = minP;
    const maxP = num(params.maxPrice);
    if (maxP != null) p.maxPrice = maxP;
    const minB = num(params.minBedrooms);
    if (minB != null) p.minBedrooms = minB;
    const minA = num(params.minArea);
    if (minA != null) p.minArea = minA;
    if (Object.keys(p).length) setFilters((f) => ({ ...f, ...p }));
    if (params.search) setSearch(params.search);
    if (params.openSearch === '1') setSearchOpen(true);
  }, [
    params.type,
    params.listingType,
    params.category,
    params.governorate,
    params.finishing,
    params.minPrice,
    params.maxPrice,
    params.minBedrooms,
    params.minArea,
    params.search,
    params.openSearch,
  ]);

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      const id = ++reqId.current;
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const query: PropertyQuery = {
        page: nextPage,
        limit: LIMIT,
        sort,
        search: search || undefined,
        ...filters,
      };

      try {
        const { data, meta } = await propertiesApi.list(query);
        if (id !== reqId.current) return;
        setTotal(meta?.pagination?.total ?? 0);
        setItems((prev) => (replace ? data : [...prev, ...data]));
        setPage(nextPage);
      } catch (e) {
        if (id !== reqId.current) return;
        setError(e instanceof Error ? e.message : S.errorDesc);
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
  const removeFilter = (key: keyof Filters) => setFilters((f) => ({ ...f, [key]: undefined }));

  const onSaveSearch = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setShowSave(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Search bar (opens the unified search + filter sheet) + save */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setSearchOpen(true)}
            className="flex-1 flex-row items-center bg-secondary rounded-xl px-3 h-12 active:opacity-90">
            <Search size={20} color={c.muted} />
            <Text
              className={`flex-1 mx-2 font-cairo text-right ${search ? 'text-foreground' : 'text-muted-foreground'}`}
              numberOfLines={1}>
              {search || S.searchPlaceholder}
            </Text>
            {activeCount > 0 ? (
              <View className="bg-primary rounded-full min-w-5 h-5 items-center justify-center px-1">
                <Text className="text-primary-foreground text-[11px] font-cairo-bold">{activeCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={onSaveSearch}
            className="items-center justify-center rounded-xl border border-border bg-card w-12 h-12 active:opacity-80">
            <Bookmark size={18} color={c.primary} />
          </Pressable>
        </View>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5" contentContainerStyle={{ gap: 8 }}>
            {chips.map((chip) => (
              <Pressable
                key={chip.key}
                onPress={() => removeFilter(chip.key)}
                className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 active:opacity-70">
                <X size={13} color={c.primary} />
                <Text className="text-primary font-cairo-semibold text-xs">{chip.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerClassName="px-4 pb-24"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Text className="text-sm text-muted-foreground font-cairo-medium py-2 text-right">
            {isLoading ? S.loading : S.resultsCount(total)}
          </Text>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : error ? (
            <View className="items-center py-16 gap-2">
              <Text className="text-lg font-cairo-bold text-foreground">{S.errorTitle}</Text>
              <Text className="text-sm text-muted-foreground font-cairo text-center px-8">{S.errorDesc}</Text>
              <Pressable onPress={() => load(1, true)} className="mt-2 bg-primary rounded-lg px-5 py-2.5 active:opacity-90">
                <Text className="text-primary-foreground font-cairo-semibold">{S.retry}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center py-20 gap-2">
              <View className="h-16 w-16 rounded-full bg-secondary items-center justify-center mb-1">
                <SearchX size={28} color={c.muted} />
              </View>
              <Text className="text-lg font-cairo-bold text-foreground">{S.noResultsTitle}</Text>
              <Text className="text-sm text-muted-foreground font-cairo">{S.noResultsDesc}</Text>
            </View>
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

      {/* Add-listing FAB */}
      <Pressable
        onPress={() => router.push('/add-property')}
        className="absolute bottom-5 left-5 h-14 w-14 rounded-full bg-primary items-center justify-center active:opacity-90"
        style={{ elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
        <Plus size={28} color={c.primaryForeground} />
      </Pressable>

      <SearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        initial={{ search, filters, sort }}
        onApply={({ search: s, filters: f, sort: so }) => {
          setSearch(s);
          setFilters(f);
          setSort(so);
        }}
      />
      <SaveSearchSheet visible={showSave} onClose={() => setShowSave(false)} filters={filters} search={search} />
    </SafeAreaView>
  );
}
