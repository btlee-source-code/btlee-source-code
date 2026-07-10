import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { PropertyFormScreen } from '@/features/properties/form/PropertyFormScreen';

export default function AddPropertyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1A3C34" />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <PropertyFormScreen />;
}
