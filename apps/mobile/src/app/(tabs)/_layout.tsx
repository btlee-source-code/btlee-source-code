import { Tabs } from 'expo-router';
import { Building2, Heart, House, User } from 'lucide-react-native';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';

export default function TabsLayout() {
  const c = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: 'Cairo_600SemiBold', fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: S.tabHome, tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="properties"
        options={{ title: S.tabProperties, tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{ title: S.tabWishlist, tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: S.tabProfile, tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
