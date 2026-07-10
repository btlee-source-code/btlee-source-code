import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { propertiesApi } from '@/features/properties/api/properties.api';
import { PropertyFormScreen } from '@/features/properties/form/PropertyFormScreen';
import { useFetch } from '@/shared/hooks/useFetch';

export default function EditPropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading } = useFetch(useCallback(() => propertiesApi.detail(id), [id]), id);

  if (authLoading || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1A3C34" />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (!data) return <Redirect href="/my-properties" />;
  return <PropertyFormScreen initial={data} />;
}
