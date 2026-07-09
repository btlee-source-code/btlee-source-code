/**
 * Expire Listings Job
 * Runs periodically (every hour). Marks any approved listing past its
 * expiresAt date as 'expired' so it disappears from search.
 */
import { Property } from '../modules/properties/property.model.js';

export async function expireListingsTick(): Promise<void> {
  const now = new Date();
  const result = await Property.updateMany(
    { status: 'approved', expiresAt: { $lte: now } },
    { status: 'expired' }
  );
  if (result.modifiedCount > 0) {
    console.log(`[jobs] Expired ${result.modifiedCount} listings`);
  }
}

let interval: NodeJS.Timeout | null = null;

export function startExpireListingsJob(): void {
  // Run once on startup
  expireListingsTick().catch((err) => console.error('[jobs] expire failed', err));

  // Then every hour
  interval = setInterval(() => {
    expireListingsTick().catch((err) => console.error('[jobs] expire failed', err));
  }, 60 * 60 * 1000);
}

export function stopExpireListingsJob(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
