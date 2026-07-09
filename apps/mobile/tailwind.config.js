/**
 * NativeWind (Tailwind) config for the Bt Lee mobile app.
 * Colors/radii mirror the web design tokens in apps/web/src/app/globals.css
 * (converted from HSL to hex) so class names match the web 1:1:
 *   bg-primary, text-foreground, bg-accent, rounded-lg, …
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand identity: Dark Forest Green primary + Warm Gold accent
        background: '#FFFFFF',
        foreground: '#1C1C1C',
        card: { DEFAULT: '#FFFFFF', foreground: '#1C1C1C' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1C1C1C' },
        primary: { DEFAULT: '#1A3C34', foreground: '#FFFFFF' }, // #1A3C34 forest green
        secondary: { DEFAULT: '#F7F7F7', foreground: '#1A3C34' },
        muted: { DEFAULT: '#F7F7F7', foreground: '#737373' },
        accent: { DEFAULT: '#C4922A', foreground: '#FFFFFF' }, // #C4922A warm gold
        destructive: { DEFAULT: '#DC2626', foreground: '#FFFFFF' },
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#1A3C34',
        status: {
          approved: '#16A34A',
          pending: '#D97706',
          rejected: '#DC2626',
          sold: '#7C3AED',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '12px', // --radius 0.75rem
        xl: '16px',
      },
      // Cairo — the site's brand font. Each weight is its own family because RN
      // doesn't synthesize weights from a single custom font; use `font-cairo`,
      // `font-cairo-medium`, `font-cairo-semibold`, `font-cairo-bold` (NOT
      // `font-bold`, which only sets fontWeight and won't pick the Cairo glyphs).
      fontFamily: {
        cairo: ['Cairo_400Regular'],
        'cairo-medium': ['Cairo_500Medium'],
        'cairo-semibold': ['Cairo_600SemiBold'],
        'cairo-bold': ['Cairo_700Bold'],
      },
    },
  },
  plugins: [],
};
