import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { S } from '@/config/strings';
import { carsApi } from '@/features/cars/api/cars.api';
import { CarCard } from '@/features/cars/components/CarCard';
import { useFetch } from '@/shared/hooks/useFetch';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';

/**
 * "Similar cars" section (same make + body type + price band, server-computed).
 * Public endpoint; renders nothing when there are no matches.
 */
export function SimilarCars({ id }: { id: string }) {
  const { data } = useFetch(useCallback(() => carsApi.similar(id), [id]), id);
  const { isTablet } = useResponsiveLayout();
  const items = (data ?? []).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <View className="gap-2 pt-4 border-t border-border">
      <Text className="text-base font-cairo-bold text-foreground text-right">{S.similarCars}</Text>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {items.map((car) => (
          <View key={car._id} style={{ width: isTablet ? '48.8%' : '100%' }}>
            <CarCard car={car} />
          </View>
        ))}
      </View>
    </View>
  );
}
