import { vars } from 'nativewind';

/**
 * Per-section CSS-variable overrides for the NativeWind className path.
 *
 * global.css defines the neutral + brand tokens as HSL triples on `:root`
 * (light) and the dark `@media` block. Wrapping a subtree in a View styled with
 * one of these `vars()` bundles overrides ONLY the brand variables for that
 * subtree, so `bg-primary` / `text-accent` / `bg-accent` re-tint per section
 * while the neutral surfaces (background/card/border/…) keep flipping with
 * light/dark exactly as before.
 *
 * Values are the HSL equivalents of BRAND in src/config/theme.ts — keep the two
 * in lock-step. The `properties` sets intentionally equal global.css so the
 * properties section renders identically to before this change.
 */
export const BRAND_VARS = {
  properties: {
    light: vars({
      '--primary': '169 38% 17%',
      '--primary-foreground': '0 0% 100%',
      '--secondary-foreground': '169 38% 17%',
      '--accent': '39 65% 47%',
      '--accent-foreground': '0 0% 100%',
    }),
    dark: vars({
      '--primary': '168 30% 52%',
      '--primary-foreground': '30 14% 6%',
      '--secondary-foreground': '40 22% 92%',
      '--accent': '39 62% 55%',
      '--accent-foreground': '30 14% 6%',
    }),
  },
  cars: {
    light: vars({
      '--primary': '205 85% 42%',
      '--primary-foreground': '0 0% 100%',
      '--secondary-foreground': '205 85% 42%',
      '--accent': '197 80% 52%',
      '--accent-foreground': '0 0% 100%',
    }),
    dark: vars({
      '--primary': '207 66% 61%',
      '--primary-foreground': '210 55% 9%',
      '--secondary-foreground': '210 20% 92%',
      '--accent': '196 76% 61%',
      '--accent-foreground': '210 55% 9%',
    }),
  },
} as const;
