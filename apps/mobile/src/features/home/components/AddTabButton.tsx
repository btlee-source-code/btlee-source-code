import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useSection } from '@/features/section/hooks/useSection';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
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
  const { isCompact, isTablet } = useResponsiveLayout();
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
        accessibilityLabel={S.addNew}
        className="flex-row items-center justify-center gap-1.5 rounded-full px-2 active:opacity-90"
        style={[
          {
            width: isTablet ? 122 : isCompact ? 96 : 108,
            height: 50,
            backgroundColor: c.accent,
            borderWidth: 4,
            borderColor: c.card,
            transform: [{ translateY: -14 }],
          },
          shadows.lg,
        ]}>
        <View
          className="h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${c.accentForeground}18` }}>
          <Plus size={20} color={c.accentForeground} strokeWidth={2.8} />
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          maxFontSizeMultiplier={1.15}
          className="flex-shrink font-cairo-bold text-[11px]"
          style={{ color: c.accentForeground }}>
          {S.addNew}
        </Text>
      </Pressable>
    </View>
  );
}
