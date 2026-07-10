/**
 * Theme tokens. The semantic color palette lives as CSS variables in
 * src/global.css (light `:root` + dark `@media`); NativeWind flips them when the
 * color scheme changes (driven by the toggle via colorScheme.set()). So classes
 * like bg-background / text-foreground / bg-card adapt automatically.
 *
 * THEME_COLORS holds the same palette as raw hex for imperative `color=` props
 * (lucide icons, inline styles) via useThemeColors().
 */
export type ThemeMode = 'light' | 'dark';

export const THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    foreground: '#1C1C1C',
    card: '#FFFFFF',
    primary: '#1A3C34',
    primaryForeground: '#FFFFFF',
    secondary: '#F7F7F7',
    muted: '#737373',
    accent: '#C4922A',
    accentForeground: '#FFFFFF',
    border: '#E5E5E5',
    destructive: '#DC2626',
    overlay: 'rgba(0,0,0,0.5)',
  },
  // Dark palette matches the web (apps/web globals.css .dark) — warm near-black.
  dark: {
    background: '#0C0A08',
    foreground: '#F2EDE3',
    card: '#141210',
    primary: '#60A99B', // softened forest green (web hsl 168 30% 52%)
    primaryForeground: '#110F0D',
    secondary: '#1E1B18',
    muted: '#A59C8D', // warm grey (muted-foreground)
    accent: '#D1A23E', // warm gold
    accentForeground: '#110F0D',
    border: '#272420',
    destructive: '#D34545',
    overlay: 'rgba(0,0,0,0.62)',
  },
} as const;

export type ThemeColors = (typeof THEME_COLORS)[ThemeMode];
