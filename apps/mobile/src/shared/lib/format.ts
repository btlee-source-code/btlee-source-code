/**
 * Formatting helpers ported from the web (apps/web/src/shared/lib/utils.ts) so
 * the mobile app renders numbers/prices identically.
 */

/**
 * Price → grouped digits. Arabic locale ('ar-EG') renders Arabic-Indic digits
 * (١٬٥٠٠٬٠٠٠) exactly like the web card. No currency symbol — the "ج.م" label is
 * rendered separately by the caller. Falls back to raw digits if Intl is
 * unavailable on the current engine.
 */
export function formatPrice(price: number, locale: 'ar' | 'en' = 'ar'): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(price);
  } catch {
    return String(price);
  }
}

export function formatDate(date: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** wa.me deep link (strips non-digits); optional prefilled message. */
export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
