import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
}

/** Labeled, RTL text input styled to the brand (Cairo, secondary fill). */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, ...props },
  ref
) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-cairo-medium text-foreground text-right">{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor="#737373"
        textAlign="right"
        className={`bg-secondary rounded-xl px-4 h-12 text-foreground font-cairo text-right ${
          error ? 'border border-destructive' : ''
        }`}
        {...props}
      />
      {error ? <Text className="text-xs text-destructive font-cairo text-right">{error}</Text> : null}
    </View>
  );
});
