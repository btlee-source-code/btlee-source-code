import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { RESPONSIVE_MAX_WIDTH } from '@/shared/hooks/useResponsiveLayout';

export type ResponsivePageSize = keyof typeof RESPONSIVE_MAX_WIDTH;

/**
 * Full-height page column that stays fluid on phones and is capped/centred on
 * tablets. The outer screen keeps its normal background while the content
 * remains comfortably readable instead of stretching edge-to-edge.
 */
export function ResponsivePage({
  children,
  size = 'wide',
  style,
}: {
  children: ReactNode;
  size?: ResponsivePageSize;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: '100%',
          maxWidth: RESPONSIVE_MAX_WIDTH[size],
          flex: 1,
          alignSelf: 'center',
        },
        style,
      ]}>
      {children}
    </View>
  );
}
