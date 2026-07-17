import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { tapHaptic } from '@/shared/lib/haptics';
import { shadows } from '@/shared/lib/shadows';

/**
 * Center "add listing" control that lives INSIDE the bottom tab bar (middle
 * slot) instead of a floating pill. It's a raised gold disc that lifts above the
 * bar — the ring is painted in the bar's own colour so it reads as a notch cut
 * into the tab bar. Not a real tab: it intercepts the press and routes to the
 * active section's post form (property / car), so it works from any tab.
 */
export function AddTabButton() {
  const router = useRouter();
  const { isCars } = useSection();
  const c = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center">
      <Pressable
        onPress={() => {
          tapHaptic();
          router.push(isCars ? '/add-car' : '/add-property');
        }}
        hitSlop={10}
        accessibilityRole="button"
        className="items-center justify-center rounded-full active:opacity-90"
        style={[
          {
            width: 54,
            height: 54,
            backgroundColor: c.accent,
            borderWidth: 4,
            borderColor: c.card,
            transform: [{ translateY: -16 }],
          },
          shadows.lg,
        ]}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2.8} />
      </Pressable>
    </View>
  );
}
