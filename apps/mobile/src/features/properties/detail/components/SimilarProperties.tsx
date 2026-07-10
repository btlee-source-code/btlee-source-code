import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { S } from '@/config/strings';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useFetch } from '@/shared/hooks/useFetch';
import { propertiesApi } from '../../api/properties.api';

/**
 * "Similar properties" section (same type + governorate + price band, server-
 * computed). Public endpoint; renders nothing when there are no matches.
 */
export function SimilarProperties({ id }: { id: string }) {
  const { data } = useFetch(useCallback(() => propertiesApi.similar(id), [id]), id);
  const items = (data ?? []).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <View className="gap-2 pt-4 border-t border-border">
      <Text className="text-base font-cairo-bold text-foreground text-right">{S.similarProperties}</Text>
      {items.map((p) => (
        <PropertyCard key={p._id} property={p} />
      ))}
    </View>
  );
}
