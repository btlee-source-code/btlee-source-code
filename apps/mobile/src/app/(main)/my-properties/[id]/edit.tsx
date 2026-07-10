import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { PropertyFormScreen } from '@/features/properties/form/PropertyFormScreen';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useFetch } from '@/shared/hooks/useFetch';

export default function EditPropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading } = useFetch(useCallback(() => propertiesApi.detail(id), [id]), id);
  const c = useThemeColors();

  if (authLoading || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (!data) return <Redirect href="/my-properties" />;
  return <PropertyFormScreen initial={data} />;
}
