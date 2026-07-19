import { forwardRef } from 'react';
import { TextInput, type TextInputProps, type TextStyle } from 'react-native';

/**
 * Text input with stable Cairo metrics on Android and iOS.
 *
 * Cairo's glyph box is taller than the default React Native input line box on
 * a few Android devices. In a fixed-height field that can clip the lower part
 * of Arabic and Latin glyphs. Keep this behaviour in one primitive so every
 * form gets the same vertical alignment instead of fixing each screen alone.
 */
export const AppTextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput(
  { multiline = false, maxFontSizeMultiplier = 1.15, style, ...props },
  ref
) {
  const textMetrics: TextStyle = multiline
    ? {
        flexShrink: 1,
        minWidth: 0,
        fontSize: 14,
        includeFontPadding: false,
        textAlignVertical: 'top',
        lineHeight: 22,
      }
    : {
        flexShrink: 1,
        minWidth: 0,
        fontSize: 14,
        includeFontPadding: false,
        textAlignVertical: 'center',
        lineHeight: 22,
        paddingVertical: 0,
      };

  return (
    <TextInput
      ref={ref}
      multiline={multiline}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[textMetrics, style]}
      {...props}
    />
  );
});
