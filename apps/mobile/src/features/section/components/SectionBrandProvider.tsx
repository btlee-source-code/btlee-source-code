import type { ReactNode } from 'react';
import { View } from 'react-native';

import { BRAND_VARS } from '@/features/section/lib/brandVars';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Injects the active section's brand CSS variables onto a full-screen wrapper,
 * so every descendant's `bg-primary` / `text-accent` className resolves to the
 * current section's brand. Reads BOTH axes (section + mode) from the store, so a
 * section switch or a light/dark toggle re-applies the right brand bundle.
 *
 * It does NOT call colorScheme.set() — light/dark stays owned by ThemeProvider;
 * this only overrides the brand tokens.
 */
export function SectionBrandProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector((s) => s.theme.mode);
  const section = useAppSelector((s) => s.section.section);

  return <View style={[{ flex: 1 }, BRAND_VARS[section][mode]]}>{children}</View>;
}
