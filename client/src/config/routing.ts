/**
 * Centralized locale routing config for next-intl.
 */
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  // Always land on Arabic for first-time visitors — ignore Accept-Language.
  // Users can still switch via the language toggle, and that choice sticks
  // through the NEXT_LOCALE cookie next-intl sets on navigation.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
