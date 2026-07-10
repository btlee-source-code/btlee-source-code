import { Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/features/theme/hooks/useTheme';

interface StarRatingProps {
  value: number;
  /** When provided, the row is interactive and each star is tappable. */
  onChange?: (value: number) => void;
  size?: number;
  disabled?: boolean;
}

/**
 * 5-star row. Read-only display when `onChange` is omitted, tappable input when
 * provided. Laid out RTL (star 1 on the right, filling leftward).
 */
export function StarRating({ value, onChange, size = 22, disabled }: StarRatingProps) {
  const c = useThemeColors();
  const filled = Math.round(value);
  return (
    <View className="flex-row-reverse gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= filled;
        const icon = <Star size={size} color={active ? c.accent : c.border} fill={active ? c.accent : 'transparent'} />;
        if (!onChange) return <View key={star}>{icon}</View>;
        return (
          <Pressable key={star} disabled={disabled} hitSlop={4} onPress={() => onChange(star)} className="active:opacity-70">
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}
