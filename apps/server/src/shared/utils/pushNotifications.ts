/**
 * Expo push delivery.
 *
 * We use Expo's push service (https://exp.host/--/api/v2/push/send) rather than
 * talking to FCM directly — the mobile app registers an Expo push token and Expo
 * relays to FCM/APNs. Sending is best-effort: a push failure must never break the
 * in-app notification write that triggered it.
 */
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100; // Expo accepts up to 100 messages per request

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface PushTicket {
  status: 'ok' | 'error';
  details?: { error?: string };
}

/**
 * Send push messages. Returns the tokens Expo reported as permanently invalid
 * (`DeviceNotRegistered`) so the caller can prune them. Never throws.
 */
export async function sendExpoPush(messages: PushMessage[]): Promise<string[]> {
  const invalidTokens: string[] = [];
  if (!messages.length) return invalidTokens;

  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      });
      const json = (await res.json()) as { data?: PushTicket[] };
      json.data?.forEach((ticket, idx) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          invalidTokens.push(chunk[idx].to);
        }
      });
    } catch (err) {
      console.error('[push] send failed', err);
    }
  }
  return invalidTokens;
}

/** Expo tokens look like `ExponentPushToken[...]` / `ExpoPushToken[...]`. */
export function isExpoPushToken(token: unknown): token is string {
  return typeof token === 'string' && /^Expo(nent)?PushToken\[.+\]$/.test(token);
}
