import { Children, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

/**
 * Keeps paired controls side-by-side on regular phones and stacks them on
 * narrow devices. Wrapping each child here avoids `flex: 1` collapsing a field
 * when the row switches to a vertical layout.
 */
export function ResponsiveFieldRow({
  children,
  reverse = false,
  breakpoint = 360,
}: {
  children: ReactNode;
  reverse?: boolean;
  breakpoint?: number;
}) {
  const { width } = useWindowDimensions();
  const stacked = width < breakpoint;
  const items = Children.toArray(children);

  return (
    <View
      style={{
        flexDirection: stacked ? 'column' : reverse ? 'row-reverse' : 'row',
        gap: 12,
      }}>
      {items.map((child, index) => (
        <View
          key={index}
          style={stacked ? { width: '100%' } : { flex: 1, minWidth: 0 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
