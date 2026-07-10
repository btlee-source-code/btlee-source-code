import { ChevronLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { shadows } from '@/shared/lib/shadows';

/**
 * Section title row (RTL): bold title on the right, optional "view all" pill
 * button on the left. Used on the home screen and inside property sections.
 */
export function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
  const c = useThemeColors();
  return (
    <View className="flex-row items-center justify-between px-5">
      {onViewAll ? (
        <Pressable
          onPress={onViewAll}
          hitSlop={6}
          className="flex-row items-center gap-0.5 rounded-full border border-border bg-card h-9 pl-2.5 pr-3.5 active:bg-secondary"
          style={shadows.sm}>
          <ChevronLeft size={14} color={c.muted} />
          <Text className="text-xs font-cairo-semibold text-muted-foreground">{S.viewAll}</Text>
        </Pressable>
      ) : (
        <View />
      )}
      <Text className="text-lg font-cairo-bold text-foreground text-right">{title}</Text>
    </View>
  );
}
