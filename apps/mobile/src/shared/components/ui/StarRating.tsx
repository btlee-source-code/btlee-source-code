import { Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';

interface StarRatingProps {
  value: number;
  /** When provided, the row is interactive and each star is tappable. */
  onChange?: (value: number) => void;
  size?: number;
  disabled?: boolean;
}

interface RatingInputProps extends Omit<StarRatingProps, 'onChange'> {
  onChange: (value: number) => void;
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

/**
 * One 1–5 choice exposed through two synchronized controls: stars and numbered
 * buttons. Either row submits the same value; `disabled` locks both together
 * after the user's first successful rating.
 */
export function RatingInput({ value, onChange, size = 28, disabled }: RatingInputProps) {
  const c = useThemeColors();

  return (
    <View
      className="w-full items-center gap-3 rounded-2xl border px-3 py-3"
      style={{ backgroundColor: c.secondary, borderColor: c.border }}>
      <StarRating value={value} onChange={onChange} size={size} disabled={disabled} />

      <View className="w-full flex-row items-center gap-2">
        <View className="h-px flex-1" style={{ backgroundColor: c.border }} />
        <Text className="font-cairo-medium text-[11px]" style={{ color: c.muted }}>
          {S.ratingChooseMethod}
        </Text>
        <View className="h-px flex-1" style={{ backgroundColor: c.border }} />
      </View>

      <View className="w-full flex-row-reverse gap-2">
        {[1, 2, 3, 4, 5].map((number) => {
          const selected = value === number;

          return (
            <Pressable
              key={number}
              accessibilityRole="button"
              accessibilityLabel={`${number} من 5`}
              accessibilityState={{ disabled: !!disabled, selected }}
              disabled={disabled}
              hitSlop={3}
              onPress={() => onChange(number)}
              className="h-10 flex-1 items-center justify-center rounded-xl active:scale-95"
              style={{
                backgroundColor: selected ? c.accent : c.card,
                borderColor: selected ? c.accent : c.border,
                borderWidth: 1,
              }}>
              <Text
                className="font-cairo-bold text-sm"
                style={{ color: selected ? c.accentForeground : c.foreground }}>
                {number}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
