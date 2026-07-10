import { Image } from 'expo-image';
import { Home, MapPin } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { formatPrice } from '@/shared/lib/format';
import type { SuggestionsResponse } from '../api/properties.api';

const PRIMARY = '#1A3C34';
const GOLD = '#C4922A';
const MUTED = '#737373';

/**
 * Suggestions dropdown card. Uses a bounded ScrollView (not a FlatList) so it
 * never nests a VirtualizedList inside the screen's outer list. The caller
 * positions it as an absolute overlay under the search bar.
 */
export function SearchSuggestions({
  data,
  onSelectArea,
  onSelectGovernorate,
  onSelectProperty,
}: {
  data: SuggestionsResponse;
  onSelectArea: (label: string) => void;
  onSelectGovernorate: (label: string) => void;
  onSelectProperty: (id: string) => void;
}) {
  const empty = data.items.length === 0 && data.properties.length === 0;

  return (
    <View
      className="bg-card border border-border rounded-xl overflow-hidden"
      style={{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
      <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {empty ? (
          <View className="px-4 py-4">
            <Text className="text-sm text-muted-foreground font-cairo text-right">{S.searchNoMatches}</Text>
          </View>
        ) : (
          <>
            {/* Locations: areas then governorates */}
            {data.items.map((item, i) => (
              <Pressable
                key={`loc-${i}`}
                onPress={() => (item.kind === 'area' ? onSelectArea(item.label) : onSelectGovernorate(item.label))}
                className="flex-row items-center gap-3 px-4 py-2.5 active:bg-secondary">
                <View className={`h-8 w-8 rounded-lg items-center justify-center ${item.kind === 'area' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                  <MapPin size={16} color={item.kind === 'area' ? PRIMARY : GOLD} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-cairo-semibold text-foreground text-right">{item.label}</Text>
                  {item.sublabel ? (
                    <Text className="text-xs text-muted-foreground font-cairo text-right">{item.sublabel}</Text>
                  ) : null}
                </View>
              </Pressable>
            ))}

            {data.items.length > 0 && data.properties.length > 0 && <View className="h-px bg-border mx-4" />}

            {/* Sample properties */}
            {data.properties.map((p) => (
              <Pressable
                key={p._id}
                onPress={() => onSelectProperty(p._id)}
                className="flex-row items-center gap-3 px-4 py-2.5 active:bg-secondary">
                <View className="h-10 w-10 rounded-lg overflow-hidden bg-secondary items-center justify-center">
                  {p.image ? (
                    <Image source={{ uri: p.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : (
                    <Home size={16} color={MUTED} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-cairo-semibold text-foreground text-right" numberOfLines={1}>
                    {p.label}
                  </Text>
                  <Text className="text-xs text-muted-foreground font-cairo text-right">{p.sublabel}</Text>
                </View>
                <Text className="text-xs font-cairo-bold text-primary">
                  {p.price != null ? `${formatPrice(p.price)} ${S.currency}` : S.priceOnRequest}
                </Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
