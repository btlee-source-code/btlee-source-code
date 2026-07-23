import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { S } from '@/config/strings';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { useFetch } from '@/shared/hooks/useFetch';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { propertiesApi } from '../../api/properties.api';

/**
 * "Similar properties" section (same type + governorate + price band, server-
 * computed). Public endpoint; renders nothing when there are no matches.
 */
export function SimilarProperties({ id }: { id: string }) {
  const { data } = useFetch(useCallback(() => propertiesApi.similar(id), [id]), id);
  const { isTablet } = useResponsiveLayout();
  const items = (data ?? []).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <View className="gap-2 pt-4 border-t border-border">
      <Text className="text-base font-cairo-bold text-foreground text-right">{S.similarProperties}</Text>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {items.map((p) => (
          <View key={p._id} style={{ width: isTablet ? '48.8%' : '100%' }}>
            <PropertyCard property={p} />
          </View>
        ))}
      </View>
    </View>
  );
}
