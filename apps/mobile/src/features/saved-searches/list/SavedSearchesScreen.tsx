import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowRight, BookmarkPlus, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { LISTING_TYPE_LABELS, TYPE_LABELS } from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import { savedSearchesApi, type SavedSearch } from '../api/savedSearches.api';

/** Compact criteria badges (governorate/type/listingType/price), like the web card. */
function badges(s: SavedSearch): string[] {
  const b: string[] = [];
  if (s.governorate) b.push(s.governorate);
  if (s.type) b.push(TYPE_LABELS[s.type as keyof typeof TYPE_LABELS] ?? s.type);
  if (s.listingType) b.push(LISTING_TYPE_LABELS[s.listingType as 'sale' | 'rent'] ?? s.listingType);
  if (s.minPrice != null) b.push(S.chipMinPrice(formatPrice(s.minPrice)));
  if (s.maxPrice != null) b.push(S.chipMaxPrice(formatPrice(s.maxPrice)));
  return b;
}

export function SavedSearchesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const c = useThemeColors();

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setItems(await savedSearchesApi.list());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const onDelete = (s: SavedSearch) => {
    Alert.alert(S.savedSearchDeleteTitle, undefined, [
      { text: S.cancel, style: 'cancel' },
      {
        text: S.deleteListing,
        style: 'destructive',
        onPress: async () => {
          setItems((prev) => prev.filter((x) => x._id !== s._id));
          await savedSearchesApi.remove(s._id).catch(() => reload());
        },
      },
    ]);
  };

  const onApply = (s: SavedSearch) => {
    const params: Record<string, string | number> = {};
    if (s.search) params.search = s.search;
    if (s.type) params.type = s.type;
    if (s.listingType) params.listingType = s.listingType;
    if (s.category) params.category = s.category;
    if (s.governorate) params.governorate = s.governorate;
    if (s.minPrice != null) params.minPrice = s.minPrice;
    if (s.maxPrice != null) params.maxPrice = s.maxPrice;
    if (s.minBedrooms != null) params.minBedrooms = s.minBedrooms;
    if (s.minArea != null) params.minArea = s.minArea;
    router.push({ pathname: '/properties', params });
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowRight size={24} color={c.primary} />
        </Pressable>
        <Text className="text-lg font-cairo-bold text-foreground">{S.savedSearchesTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isAuthenticated ? (
        <View className="flex-1 items-center justify-center px-10 gap-4">
          <Text className="text-lg font-cairo-bold text-foreground text-center">{S.profileGuestTitle}</Text>
          <Pressable onPress={() => router.push('/login')} className="bg-primary rounded-xl px-6 py-3 active:opacity-90">
            <Text className="text-primary-foreground font-cairo-semibold">{S.signInTitle}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(s) => s._id}
          contentContainerClassName="px-4 py-3"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            items.length > 0 ? (
              <Text className="text-xs text-muted-foreground font-cairo text-right pb-2">{S.savedSearchesEmptyDesc}</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const b = badges(item);
            return (
              <View className="bg-card border border-border rounded-xl p-4 mb-3 gap-2">
                <View className="flex-row items-start justify-between">
                  <Pressable onPress={() => onDelete(item)} hitSlop={8} className="active:opacity-70">
                    <Trash2 size={18} color={c.destructive} />
                  </Pressable>
                  <Text className="flex-1 text-base font-cairo-bold text-foreground text-right ml-2" numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                {b.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 justify-end">
                    {b.map((label, i) => (
                      <View key={i} className="bg-secondary rounded-full px-2.5 py-1">
                        <Text className="text-[11px] text-secondary-foreground font-cairo-medium">{label}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Pressable
                  onPress={() => onApply(item)}
                  className="mt-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-primary/10 h-10 active:opacity-80">
                  <Search size={15} color={c.primary} />
                  <Text className="text-primary font-cairo-semibold text-sm">{S.applySearch}</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            loading ? (
              <View className="items-center py-20">
                <ActivityIndicator color={c.primary} />
              </View>
            ) : (
              <View className="items-center py-16 gap-2">
                <View className="h-16 w-16 rounded-full bg-secondary items-center justify-center mb-1">
                  <BookmarkPlus size={28} color={c.muted} />
                </View>
                <Text className="text-lg font-cairo-bold text-foreground">{S.savedSearchesEmpty}</Text>
                <Text className="text-sm text-muted-foreground font-cairo text-center px-6">{S.savedSearchesEmptyDesc}</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
