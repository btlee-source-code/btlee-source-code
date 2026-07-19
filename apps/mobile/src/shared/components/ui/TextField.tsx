import { forwardRef, useState } from 'react';
import { Text, View, type TextInput, type TextInputProps } from 'react-native';

import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { AppTextInput } from './AppTextInput';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
}

/**
 * Labeled, RTL text input styled to the brand (Cairo). Card surface with a
 * hairline border that turns primary while focused — a quiet "you are here".
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, onFocus, onBlur, ...props },
  ref
) {
  const c = useThemeColors();
  const [focused, setFocused] = useState(false);
  const borderClass = error ? 'border-destructive' : focused ? 'border-primary' : 'border-border';

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-cairo-medium text-foreground text-right">{label}</Text>
      <AppTextInput
        ref={ref}
        placeholderTextColor={c.muted}
        textAlign="right"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={`bg-card border rounded-2xl px-4 h-14 text-foreground font-cairo text-right ${borderClass}`}
        {...props}
      />
      {error ? <Text className="text-xs text-destructive font-cairo text-right">{error}</Text> : null}
    </View>
  );
});
