import { useLocalSearchParams } from 'expo-router';
import { Search, SearchX, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { Property } from '@/shared/types/property';
import { propertiesApi, type PropertyQuery } from '../api/properties.api';
import { PropertyCard } from '../components/PropertyCard';

const LIMIT = 12;
const PRIMARY = '#1A3C34';
const MUTED = '#737373';

export function PropertiesScreen() {
  const params = useLocalSearchParams<{ type?: string; listingType?: string; governorate?: string }>();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      const id = ++reqId.current;
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const query: PropertyQuery = {
        page: nextPage,
        limit: LIMIT,
        sort: 'newest',
        search: debouncedSearch || undefined,
        type: params.type,
        listingType: params.listingType,
        governorate: params.governorate,
      };

      try {
        const { data, meta } = await propertiesApi.list(query);
        if (id !== reqId.current) return; // a newer request superseded this one
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
    [debouncedSearch, params.type, params.listingType, params.governorate]
  );

  // Reload from page 1 whenever the search text or an incoming filter changes.
  useEffect(() => {
    load(1, true);
  }, [load]);

  const canLoadMore = items.length < total;
  const onEndReached = () => {
    if (!isLoading && !isLoadingMore && canLoadMore) load(page + 1, false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Search bar */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-secondary rounded-xl px-3 h-12">
          <Search size={20} color={MUTED} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={S.searchPlaceholder}
            placeholderTextColor={MUTED}
            className="flex-1 mx-2 text-foreground font-cairo text-right"
            textAlign="right"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <X size={18} color={MUTED} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerClassName="px-4 pb-6"
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
    </SafeAreaView>
  );
}
