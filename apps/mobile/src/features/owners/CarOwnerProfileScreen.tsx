import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { carsApi } from '@/features/cars/api/cars.api';
import { CarCard } from '@/features/cars/components/CarCard';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDate } from '@/shared/lib/format';
import { usersApi } from './api/users.api';

/**
 * Public seller profile for cars — mirror of OwnerProfileScreen but lists the
 * seller's approved cars. Owner info (usersApi.publicOwner) is domain-agnostic
 * and reused; only the listings source (carsApi.byOwner) + card differ.
 */
export function CarOwnerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: owner, isLoading: ownerLoading } = useFetch(
    useCallback(() => usersApi.publicOwner(id), [id]),
    id
  );
  const { data: listings, isLoading: listLoading } = useFetch(
    useCallback(() => carsApi.byOwner(id), [id]),
    id
  );
  const c = useThemeColors();

  if (ownerLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['bottom']}>
        <ActivityIndicator color={c.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <FlatList
        data={listings ?? []}
        keyExtractor={(car) => car._id}
        contentContainerClassName="px-4 pb-6"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-2 py-5">
            <View className="items-center gap-2">
              {owner?.avatar ? (
                <Image source={{ uri: owner.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} contentFit="cover" />
              ) : (
                <View className="h-20 w-20 rounded-full bg-secondary items-center justify-center">
                  <Text className="text-primary text-2xl font-cairo-bold">{owner?.name?.charAt(0) ?? '؟'}</Text>
                </View>
              )}
              <Text className="text-lg font-cairo-bold text-foreground">{owner?.name}</Text>
              {owner?.createdAt ? (
                <Text className="text-xs text-muted-foreground font-cairo">
                  {S.memberSince} {formatDate(owner.createdAt)}
                </Text>
              ) : null}
              <Text className="text-xs text-muted-foreground font-cairo">{S.listingsCount(listings?.length ?? 0)}</Text>
            </View>
            <Text className="text-base font-cairo-bold text-foreground text-right mt-3">{S.allListingsByOwner}</Text>
          </View>
        }
        ListEmptyComponent={
          listLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={c.primary} />
            </View>
          ) : (
            <View className="items-center py-16">
              <Text className="text-sm text-muted-foreground font-cairo">{S.noOwnerListings}</Text>
            </View>
          )
        }
        renderItem={({ item }) => <CarCard car={item} />}
      />
    </SafeAreaView>
  );
}
