'use client';
/**
 * Registers the localized Zod error map globally so every form's validation
 * messages render in the active locale. Mounted once near the app root.
 */
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { createZodErrorMap } from '@/shared/lib/zodErrorMap';

export function ZodI18nSetup() {
  const t = useTranslations('errors');
  // Re-registered on every render — cheap, and guarantees the map always
  // reflects the current locale. The map is consumed at parse time (submit),
  // so it only needs to be set before any form is submitted.
  z.config({ customError: createZodErrorMap(t) as never });
  return null;
}
