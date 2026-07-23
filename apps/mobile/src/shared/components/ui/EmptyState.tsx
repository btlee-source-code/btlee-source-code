import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { PressableScale } from '@/shared/components/ui/PressableScale';
import { shadows } from '@/shared/lib/shadows';

/**
 * Friendly empty/error state: the icon sits in a soft two-ring "blob" with
 * little floating accent dots (the playful touch), then title, description and
 * an optional action button. Bounces in on mount.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const c = useThemeColors();
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className="items-center px-8 py-14"
      style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
      {/* Blob + playful dots */}
      <View className="mb-4">
        <View className="h-28 w-28 rounded-full bg-primary/10 items-center justify-center">
          <View
            className="h-[76px] w-[76px] rounded-full bg-card border border-border items-center justify-center"
            style={shadows.sm}>
            <Icon size={32} color={c.primary} strokeWidth={1.7} />
          </View>
        </View>
        <View className="absolute -top-0.5 right-1 h-3.5 w-3.5 rounded-full bg-accent/60" />
        <View className="absolute bottom-1 -left-2 h-2.5 w-2.5 rounded-full bg-accent/40" />
        <View className="absolute top-7 -right-3 h-2 w-2 rounded-full bg-primary/30" />
      </View>

      <Text className="text-lg font-cairo-bold text-foreground text-center">{title}</Text>
      {description ? (
        <Text className="text-sm leading-6 text-muted-foreground font-cairo text-center mt-1">{description}</Text>
      ) : null}

      {actionLabel && onAction ? (
        <PressableScale
          haptic
          onPress={onAction}
          containerClassName="mt-4"
          className="bg-primary rounded-full min-h-12 px-8 py-2 items-center justify-center"
          style={{ maxWidth: '100%' }}>
          <Text
            numberOfLines={2}
            maxFontSizeMultiplier={1.2}
            className="text-primary-foreground font-cairo-bold text-center">
            {actionLabel}
          </Text>
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}
