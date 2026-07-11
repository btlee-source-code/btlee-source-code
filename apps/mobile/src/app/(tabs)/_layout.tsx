import { Tabs } from 'expo-router';
import { Heart, House, Search, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { tapHaptic } from '@/shared/lib/haptics';

export default function TabsLayout() {
  const c = useThemeColors();
  const { isCars } = useSection();
  // Respect the device's gesture/nav bar — a fixed height clips the labels on
  // phones with a bottom inset.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenListeners={{ tabPress: () => tapHaptic() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: c.border,
          height: 58 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: 'Cairo_600SemiBold', fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: S.tabHome, tabBarIcon: ({ color }) => <House color={color} size={23} /> }}
      />
      <Tabs.Screen
        name="properties"
        options={{ title: isCars ? S.sectionCars : S.tabProperties, tabBarIcon: ({ color }) => <Search color={color} size={23} /> }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{ title: S.tabWishlist, tabBarIcon: ({ color }) => <Heart color={color} size={23} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: S.tabProfile, tabBarIcon: ({ color }) => <User color={color} size={23} /> }}
      />
    </Tabs>
  );
}
