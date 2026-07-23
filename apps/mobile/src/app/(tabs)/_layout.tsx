import { Tabs } from 'expo-router';
import { Heart, House, Search, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { S } from '@/config/strings';
import { AddTabButton } from '@/features/home/components/AddTabButton';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { tapHaptic } from '@/shared/lib/haptics';

export default function TabsLayout() {
  const c = useThemeColors();
  const { isCars } = useSection();
  // Respect the device's gesture/nav bar — a fixed height clips the labels on
  // phones with a bottom inset.
  const insets = useSafeAreaInsets();
  const { width, isTablet } = useResponsiveLayout();
  const tabBarWidth = isTablet ? Math.min(width - 40, 680) : width;

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
          width: tabBarWidth,
          alignSelf: 'center',
          borderTopLeftRadius: isTablet ? 22 : 0,
          borderTopRightRadius: isTablet ? 22 : 0,
        },
        tabBarItemStyle: isTablet ? { maxWidth: 136 } : undefined,
        tabBarLabelStyle: { fontFamily: 'Cairo_600SemiBold', fontSize: 11 },
        tabBarAllowFontScaling: false,
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
        name="add"
        options={{ title: '', tabBarButton: () => <AddTabButton /> }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
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
