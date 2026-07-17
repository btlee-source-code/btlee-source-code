import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { S } from '@/config/strings';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { shadows } from '@/shared/lib/shadows';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Home "add listing" call-to-action — an extended FAB that floats in the bottom
 * corner (RTL-leading = left), above the tab bar. Always visible so posting is a
 * single tap from anywhere on the home, without taking a slot in the layout.
 * Painted in the section's ACCENT (gold on properties, cyan on cars) so it pops
 * against the primary-coloured chrome, and it routes to the active section's form.
 */
export function AddListingFab() {
  const router = useRouter();
  const { isCars } = useSection();
  const c = useThemeColors();

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(280).springify().damping(16)}
      onPress={() => router.push(isCars ? '/add-car' : '/add-property')}
      hitSlop={6}
      className="absolute flex-row items-center gap-2 rounded-full active:opacity-90"
      style={[
        { bottom: 18, left: 18, height: 52, paddingHorizontal: 20, backgroundColor: c.accent },
        shadows.lg,
      ]}>
      <Plus size={22} color="#FFFFFF" strokeWidth={2.6} />
      <Text className="font-cairo-bold text-[15px]" style={{ color: '#FFFFFF' }}>
        {S.addNew}
      </Text>
    </AnimatedPressable>
  );
}
