/** Expiry timestamp `days` from now — the listing duration clock. */
export function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Admin renew request: either a fresh duration, or an open-ended listing that
 * the expiry job never touches. Open-ended is admin-only (admin panel).
 */
export type ExtendListingsInput =
  | { ids: string[]; neverExpires: true }
  | { ids: string[]; neverExpires?: false; durationDays: number };

/** Statuses an admin may renew — reviving a sold/rented/rejected listing is not renewal. */
export const RENEWABLE_STATUSES = ['expired', 'approved'] as const;

/**
 * The `$set` payload shared by the property and car renew handlers. Renewing
 * always lands on `approved`: an expired listing was already reviewed once, so
 * it goes straight back to live rather than through the queue again. The
 * notification flags reset so the *next* expiry notifies the owner again.
 */
export function buildExtendUpdate(input: ExtendListingsInput) {
  const timing = input.neverExpires
    ? { neverExpires: true }
    : {
        neverExpires: false,
        durationDays: input.durationDays,
        expiresAt: addDays(input.durationDays),
      };

  return {
    ...timing,
    status: 'approved' as const,
    expiryNotificationPending: false,
    expiryNotificationSentAt: null,
  };
}
