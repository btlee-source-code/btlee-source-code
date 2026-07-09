'use client';
/**
 * Admin theme helpers.
 *
 * The site now has a single, global light/dark theme (toggled from the navbar
 * and persisted under `btlee-theme`). The admin panel simply reuses it, so
 * these are thin wrappers kept for backwards-compatible imports:
 *  - AdminThemeToggle → the shared site ThemeToggle.
 *  - AdminThemeCleanup → a no-op (it used to strip `.dark` on unmount, which
 *    would wrongly force the public site back to light).
 */
import { ThemeToggle } from '@/shared/components/layout/ThemeToggle';

export function AdminThemeToggle() {
  return <ThemeToggle />;
}

export function AdminThemeCleanup() {
  return null;
}
