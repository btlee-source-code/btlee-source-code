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
        // Semantic colors are HSL CSS variables copied from the web
        // (src/global.css). They flip between light/dark automatically.
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--primary) / <alpha-value>)',
        // Fixed status hues (same in both themes).
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
