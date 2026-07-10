import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useFetch } from '@/shared/hooks/useFetch';
import type { Property } from '@/shared/types/property';

const CARD_WIDTH = 280;

/**
 * A titled horizontal carousel of properties for the home screen
 * (e.g. featured / latest). Hidden entirely when the section is empty.
 */
export function PropertySection({
  title,
  fetcher,
  cacheKey,
}: {
  title: string;
  fetcher: () => Promise<Property[]>;
  cacheKey: string;
}) {
  const router = useRouter();
  const { data, isLoading } = useFetch(fetcher, cacheKey);
  const c = useThemeColors();
  const items = data ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.push('/properties')} className="flex-row items-center active:opacity-70">
          <ChevronLeft size={16} color={c.primary} />
          <Text className="text-primary font-cairo-semibold text-sm">{S.viewAll}</Text>
        </Pressable>
        <Text className="text-lg font-cairo-bold text-foreground text-right">{title}</Text>
      </View>

      {isLoading ? (
        <View className="py-12 items-center">
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(p) => p._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 4 }}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH, marginRight: 12 }}>
              <PropertyCard property={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
