/**
 * Theme tokens. The semantic color palette lives as CSS variables in
 * src/global.css (light `:root` + dark `@media`); NativeWind flips them when the
 * color scheme changes (driven by the toggle via colorScheme.set()). So classes
 * like bg-background / text-foreground / bg-card adapt automatically.
 *
 * THEME_COLORS holds the same palette as raw hex for imperative `color=` props
 * (lucide icons, inline styles) via useThemeColors().
 *
 * Two axes:
 *   • mode    — light | dark   (neutral surfaces; unchanged per section)
 *   • section — properties | cars  (BRAND colors: primary + accent)
 * The neutral surfaces are shared across sections; only the brand (primary /
 * accent) differs, so switching section re-tints the app without disturbing
 * light/dark. The per-className equivalent is BRAND_VARS in
 * features/section/lib/brandVars.ts (kept in lock-step with the values here).
 */
export type ThemeMode = 'light' | 'dark';
export type Section = 'properties' | 'cars';

// Neutral surfaces — identical across sections, only flip with light/dark.
const NEUTRAL = {
  light: {
    background: '#FFFFFF',
    foreground: '#1C1C1C',
    card: '#FFFFFF',
    secondary: '#F7F7F7',
    muted: '#737373',
    border: '#E5E5E5',
    destructive: '#DC2626',
    overlay: 'rgba(0,0,0,0.5)',
  },
  // Dark palette matches the web (apps/web globals.css .dark) — warm near-black.
  dark: {
    background: '#0C0A08',
    foreground: '#F2EDE3',
    card: '#141210',
    secondary: '#1E1B18',
    muted: '#A59C8D', // warm grey (muted-foreground)
    border: '#272420',
    destructive: '#D34545',
    overlay: 'rgba(0,0,0,0.62)',
  },
} as const;

// Brand colors per section. `properties` keeps the original forest-green/gold;
// `cars` is a clean blue (on the shared white/grey neutrals) per the brief.
const BRAND = {
  properties: {
    light: { primary: '#1A3C34', primaryForeground: '#FFFFFF', accent: '#FDB803', accentForeground: '#1C1C1C' },
    dark: { primary: '#60A99B', primaryForeground: '#110F0D', accent: '#FDB803', accentForeground: '#110F0D' },
  },
  cars: {
    light: { primary: '#0F76C4', primaryForeground: '#FFFFFF', accent: '#23AFE7', accentForeground: '#FFFFFF' },
    dark: { primary: '#58A6E0', primaryForeground: '#0A1826', accent: '#4FC0E8', accentForeground: '#0A1826' },
  },
} as const;

const compose = (section: Section, mode: ThemeMode) => ({
  ...NEUTRAL[mode],
  ...BRAND[section][mode],
});

export const THEME_COLORS = {
  properties: { light: compose('properties', 'light'), dark: compose('properties', 'dark') },
  cars: { light: compose('cars', 'light'), dark: compose('cars', 'dark') },
} as const;

export type ThemeColors = ReturnType<typeof compose>;
