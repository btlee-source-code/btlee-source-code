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
  { multiline = false, style, ...props },
  ref
) {
  const textMetrics: TextStyle = multiline
    ? {
        includeFontPadding: false,
        textAlignVertical: 'top',
        lineHeight: 22,
      }
    : {
        includeFontPadding: false,
        textAlignVertical: 'center',
        lineHeight: 20,
        paddingVertical: 0,
      };

  return <TextInput ref={ref} multiline={multiline} style={[textMetrics, style]} {...props} />;
});
