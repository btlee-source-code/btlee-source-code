'use client';
/**
 * Site-wide light/dark theme toggle.
 * Toggles the `dark` class on <html> and persists the choice in a cookie
 * (`btlee-theme`). The root layout reads that cookie on the server and renders
 * the `dark` class directly on <html>, so there is no flash of the wrong theme
 * and no client-side <script> (which React would warn about on re-render).
 *
 * `dropdown` (default) renders the icon button for the top bar;
 * `inline` renders a labelled row for the mobile menu.
 */
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';

export const THEME_COOKIE = 'btlee-theme';
// One year — the choice should stick across sessions.
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  // Persisted as a cookie so the server can render the correct theme on <html>.
  document.cookie = `${THEME_COOKIE}=${dark ? 'dark' : 'light'}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

interface ThemeToggleProps {
  /** `dropdown` (default) for the top bar; `inline` for the mobile menu. */
  variant?: 'dropdown' | 'inline';
  /** Called after toggling — used to close the mobile menu. */
  onToggle?: () => void;
}

export function ThemeToggle({ variant = 'dropdown', onToggle }: ThemeToggleProps) {
  const t = useTranslations('nav');
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  // Sync icon state from the class the server already applied (from the cookie).
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains('dark');
    applyTheme(next);
    setDark(next);
    onToggle?.();
  }

  // The label/icon reflect the mode you switch TO (so it reads as an action).
  const isDark = mounted && dark;

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        {isDark ? t('lightMode') : t('darkMode')}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? t('lightMode') : t('darkMode')}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
