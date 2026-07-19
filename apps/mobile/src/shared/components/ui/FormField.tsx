import { CircleAlert } from 'lucide-react-native';
import { forwardRef, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useThemeColors } from '@/features/theme/hooks/useTheme';

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/**
 * Shared listing-form field with an inline validation state.
 *
 * The validation outline is drawn over the existing control, so inputs,
 * pickers, chip groups, maps, and image rows all receive the same red border
 * without changing their dimensions or requiring error-specific props.
 */
export const FormField = forwardRef<View, FormFieldProps>(function FormField(
  { label, hint, error, children },
  ref
) {
  const c = useThemeColors();

  return (
    <View ref={ref} collapsable={false} className="gap-2.5">
      <View className="flex-row items-center justify-end gap-2">
        <Text
          maxFontSizeMultiplier={1.2}
          className="flex-shrink text-[15px] font-cairo-bold text-foreground text-right">
          {label}
        </Text>
        <View className={`w-1.5 h-[18px] rounded-full ${error ? 'bg-destructive' : 'bg-accent'}`} />
      </View>

      <View className="relative">
        {children}
        {error ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 rounded-xl border-2 border-destructive"
          />
        ) : null}
      </View>

      {error ? (
        <View
          accessibilityLiveRegion="polite"
          className="flex-row items-start justify-end gap-1.5">
          <Text className="flex-shrink text-xs leading-5 text-destructive font-cairo-semibold text-right">
            {error}
          </Text>
          <CircleAlert size={15} color={c.destructive} style={{ marginTop: 2 }} />
        </View>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground font-cairo text-right">{hint}</Text>
      ) : null}
    </View>
  );
});
