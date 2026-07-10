import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowUpDown, Bookmark, Search, SearchX, SlidersHorizontal, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SaveSearchSheet } from '@/features/saved-searches/components/SaveSearchSheet';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { SearchSuggestions } from '../search/SearchSuggestions';
import { useSearchSuggestions } from '../search/useSearchSuggestions';
import {
  CATEGORY_LABELS,
  FINISHING_LABELS,
  LISTING_TYPE_LABELS,
  TYPE_LABELS,
} from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import type { Property } from '@/shared/types/property';
import { propertiesApi, type PropertyQuery } from '../api/properties.api';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilters, type Filters } from './PropertyFilters';
import { SortSheet, type SortValue } from './SortSheet';

const LIMIT = 12;
const PRIMARY = '#1A3C34';
const MUTED = '#737373';

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
  }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<SortValue>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const { data: suggestions } = useSearchSuggestions(search);

  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // Apply incoming filters passed via navigation (home type tap, or an applied saved search).
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
        search: debouncedSearch || undefined,
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
    [debouncedSearch, sort, filters]
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

  const showSuggestions = suggestOpen && search.trim().length > 0 && suggestions != null;
  const selectArea = (label: string) => {
    setSearch(label);
    setSuggestOpen(false);
    Keyboard.dismiss();
  };
  const selectGovernorate = (label: string) => {
    setSearch('');
    setFilters((f) => ({ ...f, governorate: label }));
    setSuggestOpen(false);
    Keyboard.dismiss();
  };
  const selectProperty = (pid: string) => {
    setSuggestOpen(false);
    Keyboard.dismiss();
    router.push(`/properties/${pid}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Search */}
      <View className="px-4 pt-3 pb-2" style={{ zIndex: 50 }}>
        <View style={{ zIndex: 50 }}>
          <View className="flex-row items-center bg-secondary rounded-xl px-3 h-12">
            <Search size={20} color={MUTED} />
            <TextInput
              value={search}
              onChangeText={(t) => {
                setSearch(t);
                setSuggestOpen(true);
              }}
              onFocus={() => setSuggestOpen(true)}
              placeholder={S.searchPlaceholder}
              placeholderTextColor={MUTED}
              className="flex-1 mx-2 text-foreground font-cairo text-right"
              textAlign="right"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearch('');
                  setSuggestOpen(false);
                }}
                hitSlop={8}>
                <X size={18} color={MUTED} />
              </Pressable>
            )}
          </View>

          {/* Autocomplete overlay (glued under the input) */}
          {showSuggestions && suggestions ? (
            <View style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 50 }}>
              <SearchSuggestions
                data={suggestions}
                onSelectArea={selectArea}
                onSelectGovernorate={selectGovernorate}
                onSelectProperty={selectProperty}
              />
            </View>
          ) : null}
        </View>

        {/* Filter + sort controls */}
        <View className="flex-row gap-2 mt-2.5 items-center">
          <Pressable
            onPress={() => setShowFilters(true)}
            className="flex-row items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 h-10 active:opacity-80">
            <SlidersHorizontal size={16} color={PRIMARY} />
            <Text className="font-cairo-semibold text-sm text-foreground">{S.filterBtn}</Text>
            {activeCount > 0 && (
              <View className="bg-primary rounded-full min-w-5 h-5 items-center justify-center px-1">
                <Text className="text-primary-foreground text-[11px] font-cairo-bold">{activeCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => setShowSort(true)}
            className="flex-row items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 h-10 active:opacity-80">
            <ArrowUpDown size={16} color={PRIMARY} />
            <Text className="font-cairo-semibold text-sm text-foreground">{S.sortBtn}</Text>
          </Pressable>
          <View className="flex-1" />
          <Pressable
            onPress={onSaveSearch}
            className="items-center justify-center rounded-lg border border-border bg-card w-10 h-10 active:opacity-80">
            <Bookmark size={16} color={PRIMARY} />
          </Pressable>
        </View>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5" contentContainerStyle={{ gap: 8 }}>
            {chips.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => removeFilter(c.key)}
                className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 active:opacity-70">
                <X size={13} color={PRIMARY} />
                <Text className="text-primary font-cairo-semibold text-xs">{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => setSuggestOpen(false)}
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
              <ActivityIndicator color={PRIMARY} />
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
                <SearchX size={28} color={MUTED} />
              </View>
              <Text className="text-lg font-cairo-bold text-foreground">{S.noResultsTitle}</Text>
              <Text className="text-sm text-muted-foreground font-cairo">{S.noResultsDesc}</Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4">
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : null
        }
      />

      <PropertyFilters
        visible={showFilters}
        initial={filters}
        onClose={() => setShowFilters(false)}
        onApply={(f) => {
          setFilters(f);
          setShowFilters(false);
        }}
      />
      <SortSheet visible={showSort} value={sort} onSelect={setSort} onClose={() => setShowSort(false)} />
      <SaveSearchSheet
        visible={showSave}
        onClose={() => setShowSave(false)}
        filters={filters}
        search={debouncedSearch}
      />
    </SafeAreaView>
  );
}
