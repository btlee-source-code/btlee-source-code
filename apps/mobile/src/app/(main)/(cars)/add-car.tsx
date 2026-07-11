import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { CarFormScreen } from '@/features/cars/form/CarFormScreen';
import { useThemeColors } from '@/features/theme/hooks/useTheme';

export default function AddCarRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const c = useThemeColors();
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <CarFormScreen />;
}
