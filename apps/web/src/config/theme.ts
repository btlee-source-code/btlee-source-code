/**
 * Theme persistence, shared by the server layout and the client toggle.
 *
 * These live here rather than in ThemeToggle on purpose: that file is a
 * `'use client'` module, and a value imported from one into a Server Component
 * arrives as a client reference (a function), not the string itself — so
 * `cookies().get(THEME_COOKIE)` silently looked up the wrong name and the
 * saved theme never survived a reload.
 */
export const THEME_COOKIE = 'btlee-theme';

/** One year — the choice should stick across sessions. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
