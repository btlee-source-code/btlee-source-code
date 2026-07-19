import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowRight, Car as CarIcon, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { carsApi } from '@/features/cars/api/cars.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { STATUS_LABELS } from '@/shared/lib/constants';
import { formatPrice } from '@/shared/lib/format';
import type { Car, CarStatus } from '@/shared/types/car';

const STATUS_COLORS: Record<CarStatus, { bg: string; fg: string }> = {
  pending: { bg: '#FEF3C7', fg: '#B45309' },
  approved: { bg: '#D1FAE5', fg: '#047857' },
  rejected: { bg: '#FEE2E2', fg: '#B91C1C' },
  sold: { bg: '#EDE9FE', fg: '#6D28D9' },
  rented: { bg: '#EDE9FE', fg: '#6D28D9' },
  expired: { bg: '#F3F4F6', fg: '#4B5563' },
};

export function MyCarsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const c = useThemeColors();

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setItems(await carsApi.mine());
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

  const onDelete = (car: Car) => {
    Alert.alert(S.confirmDeleteTitle, S.confirmDeleteDesc, [
      { text: S.cancel, style: 'cancel' },
      {
        text: S.deleteListing,
        style: 'destructive',
        onPress: async () => {
          setItems((prev) => prev.filter((x) => x._id !== car._id));
          await carsApi.remove(car._id).catch(() => reload());
        },
      },
    ]);
  };

  const onMark = async (car: Car) => {
    const status = car.listingType === 'rent' ? 'rented' : 'sold';
    setItems((prev) => prev.map((x) => (x._id === car._id ? { ...x, status } : x)));
    await carsApi.mark(car._id, status).catch(() => reload());
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
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowRight size={24} color={c.primary} />
        </Pressable>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          className="flex-1 mx-2 text-center text-lg font-cairo-bold text-foreground">
          {S.myCarsTitle}
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
          keyExtractor={(car) => car._id}
          contentContainerClassName="px-4 py-3"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status];
            return (
              <View className="bg-card border border-border rounded-xl overflow-hidden mb-3">
                <Pressable onPress={() => router.push(`/cars/${item._id}`)} className="flex-row gap-3 p-3 active:opacity-90">
                  <View className="h-20 w-20 rounded-lg overflow-hidden bg-secondary">
                    {item.images?.[0]?.url ? (
                      <Image source={{ uri: item.images[0].url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <CarIcon size={22} color={c.muted} />
                      </View>
                    )}
                  </View>
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center justify-between">
                      <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: sc.bg }}>
                        <Text className="text-[11px] font-cairo-semibold" style={{ color: sc.fg }}>{STATUS_LABELS[item.status]}</Text>
                      </View>
                      <Text className="font-cairo-bold text-primary text-right flex-1 mr-2" numberOfLines={1}>
                        {item.price != null ? `${formatPrice(item.price)} ${S.currency}` : S.priceOnRequest}
                      </Text>
                    </View>
                    <Text className="text-sm text-foreground font-cairo-medium text-right" numberOfLines={1}>
                      {item.make} {item.model} {item.year}
                    </Text>
                    <Text className="text-xs text-muted-foreground font-cairo text-right">{S.viewsCount(item.viewCount)}</Text>
                  </View>
                </Pressable>

                {item.status === 'rejected' && item.rejectionReason ? (
                  <View className="px-3 pb-2">
                    <Text className="text-xs text-destructive font-cairo text-right">
                      {S.rejectionReason}: {item.rejectionReason}
                    </Text>
                  </View>
                ) : null}

                <View className="flex-row border-t border-border">
                  <Pressable onPress={() => router.push(`/my-cars/${item._id}/edit`)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 active:bg-secondary">
                    <Pencil size={16} color={c.primary} />
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                      className="flex-shrink text-sm font-cairo-medium text-foreground">
                      {S.editListing}
                    </Text>
                  </Pressable>
                  {item.status === 'approved' && (
                    <Pressable onPress={() => onMark(item)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 border-r border-border active:bg-secondary">
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                        className="flex-shrink text-sm font-cairo-medium text-foreground">
                        {item.listingType === 'rent' ? S.markRented : S.markSold}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => onDelete(item)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 border-r border-border active:bg-secondary">
                    <Trash2 size={16} color={c.destructive} />
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                      className="flex-shrink text-sm font-cairo-medium text-destructive">
                      {S.deleteListing}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            <Pressable onPress={() => router.push('/add-car')} className="bg-accent rounded-xl h-12 flex-row items-center justify-center gap-2 mb-4 active:opacity-90">
              <Plus size={20} color={c.accentForeground} />
              <Text className="text-accent-foreground font-cairo-bold">{S.addNewCar}</Text>
            </Pressable>
          }
          ListEmptyComponent={
            loading ? (
              <View className="items-center py-20">
                <ActivityIndicator color={c.primary} />
              </View>
            ) : (
              <View className="items-center py-16 gap-2">
                <View className="h-16 w-16 rounded-full bg-secondary items-center justify-center mb-1">
                  <CarIcon size={28} color={c.muted} />
                </View>
                <Text className="text-lg font-cairo-bold text-foreground">{S.noCarsMineTitle}</Text>
                <Text className="text-sm text-muted-foreground font-cairo">{S.noCarsMineDesc}</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
