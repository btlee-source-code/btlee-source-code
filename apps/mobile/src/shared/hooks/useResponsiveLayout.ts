import { useWindowDimensions } from 'react-native';

export const RESPONSIVE_BREAKPOINTS = {
  compact: 360,
  tablet: 600,
  largeTablet: 900,
} as const;

export const RESPONSIVE_MAX_WIDTH = {
  compact: 560,
  form: 780,
  content: 900,
  wide: 1120,
} as const;

/**
 * Shared screen-size decisions for the mobile app.
 *
 * Keeping these values in one place prevents every screen from inventing its
 * own tablet breakpoint and makes phone, tablet and large-tablet behaviour
 * consistent.
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < RESPONSIVE_BREAKPOINTS.compact;
  const isTablet = width >= RESPONSIVE_BREAKPOINTS.tablet;
  const isLargeTablet = width >= RESPONSIVE_BREAKPOINTS.largeTablet;

  return {
    width,
    height,
    isCompact,
    isTablet,
    isLargeTablet,
    listColumns: isLargeTablet ? 3 : isTablet ? 2 : 1,
    // Six category cards stay visually balanced: 2×3 on phones/tablets and a
    // single 1×6 rail only when there is genuinely enough horizontal room.
    categoryColumns: isLargeTablet ? 6 : isCompact ? 2 : 3,
    pagePadding: isTablet ? 28 : 20,
  };
}
