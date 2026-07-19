import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useFetch } from '@/shared/hooks/useFetch';
import { formatDate } from '@/shared/lib/format';
import { usersApi } from './api/users.api';

/**
 * Public owner profile: header card (avatar/initial, name, member-since, count)
 * + a list of the owner's approved listings (server-capped at 12). No contact
 * info here — contact stays on the property detail's WhatsApp CTA (matches web).
 */
export function OwnerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: owner, isLoading: ownerLoading } = useFetch(
    useCallback(() => usersApi.publicOwner(id), [id]),
    id
  );
  const { data: listings, isLoading: listLoading } = useFetch(
    useCallback(() => propertiesApi.byOwner(id), [id]),
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
        keyExtractor={(p) => p._id}
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
        renderItem={({ item }) => <PropertyCard property={item} />}
      />
    </SafeAreaView>
  );
}
