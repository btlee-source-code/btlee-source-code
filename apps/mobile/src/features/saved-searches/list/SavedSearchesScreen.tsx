import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowRight, BookmarkPlus, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CAR_BODY_TYPE_LABELS, CAR_CONDITION_LABELS } from '@/features/cars/lib/carConstants';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { LISTING_TYPE_LABELS, TYPE_LABELS } from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import type { CarBodyType, CarCondition } from '@/shared/types/car';
import { savedSearchesApi, type CarSavedSearch, type SavedSearch } from '../api/savedSearches.api';

type AnySaved = SavedSearch | CarSavedSearch;
const isCar = (s: AnySaved): s is CarSavedSearch => 'bodyType' in s;

/** Compact criteria badges for either domain. */
function badges(s: AnySaved): string[] {
  const b: string[] = [];
  if (s.governorate) b.push(s.governorate);
  if (isCar(s)) {
    if (s.condition) b.push(CAR_CONDITION_LABELS[s.condition as CarCondition] ?? s.condition);
    if (s.bodyType) b.push(CAR_BODY_TYPE_LABELS[s.bodyType as CarBodyType] ?? s.bodyType);
  } else if (s.type) {
    b.push(TYPE_LABELS[s.type as keyof typeof TYPE_LABELS] ?? s.type);
  }
  if (s.listingType) b.push(LISTING_TYPE_LABELS[s.listingType as 'sale' | 'rent'] ?? s.listingType);
  if (s.minPrice != null) b.push(S.chipMinPrice(formatPrice(s.minPrice)));
  if (s.maxPrice != null) b.push(S.chipMaxPrice(formatPrice(s.maxPrice)));
  return b;
}

export function SavedSearchesScreen() {
  const router = useRouter();
  const { isCars } = useSection();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<AnySaved[]>([]);
  const [loading, setLoading] = useState(true);
  const c = useThemeColors();

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setItems(isCars ? await savedSearchesApi.listCars() : await savedSearchesApi.list());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCars]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const onDelete = (s: AnySaved) => {
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

  const onApply = (s: AnySaved) => {
    const params: Record<string, string | number> = {};
    if (s.search) params.search = s.search;
    if (s.listingType) params.listingType = s.listingType;
    if (s.governorate) params.governorate = s.governorate;
    if (s.minPrice != null) params.minPrice = s.minPrice;
    if (s.maxPrice != null) params.maxPrice = s.maxPrice;
    if (isCar(s)) {
      if (s.condition) params.condition = s.condition;
      if (s.bodyType) params.bodyType = s.bodyType;
      if (s.fuelType) params.fuelType = s.fuelType;
      if (s.transmission) params.transmission = s.transmission;
      if (s.minYear != null) params.minYear = s.minYear;
      if (s.maxYear != null) params.maxYear = s.maxYear;
      if (s.maxMileage != null) params.maxMileage = s.maxMileage;
    } else {
      if (s.type) params.type = s.type;
      if (s.category) params.category = s.category;
      if (s.minBedrooms != null) params.minBedrooms = s.minBedrooms;
      if (s.minArea != null) params.minArea = s.minArea;
    }
    router.push({ pathname: '/properties', params });
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top', 'bottom']}>
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowRight size={24} color={c.primary} />
        </Pressable>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          className="flex-1 mx-2 text-center text-lg font-cairo-bold text-foreground">
          {S.savedSearchesTitle}
        </Text>
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
