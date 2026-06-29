/**
 * Utility helpers shared across the app.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes deduplicating conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price as a localized currency string. */
export function formatPrice(price: number, locale: 'ar' | 'en' = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(price);
}

/** Format a date as YYYY-MM-DD. */
export function formatDate(date: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Build a WhatsApp link with a pre-filled message. */
export function whatsappLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  const base = `https://wa.me/${cleaned}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Convert an enum-like value to a translation key fragment. */
export function safeKey(value: string | null | undefined): string {
  return (value ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
}
