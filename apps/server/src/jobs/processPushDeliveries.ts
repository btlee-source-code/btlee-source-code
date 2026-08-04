import { processPushDeliveriesTick } from '../modules/notifications/pushDelivery.service.js';

const PUSH_DELIVERY_INTERVAL_MS = 60 * 1000;
let interval: NodeJS.Timeout | null = null;

export function startPushDeliveryJob(): void {
  // Recover durable queued messages/receipts immediately after every restart.
  void processPushDeliveriesTick();
  interval = setInterval(() => {
    void processPushDeliveriesTick();
  }, PUSH_DELIVERY_INTERVAL_MS);
}

export function stopPushDeliveryJob(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
