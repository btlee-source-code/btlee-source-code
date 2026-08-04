/**
 * Reliable Expo push transport.
 *
 * Expo first returns push tickets, then exposes the final FCM/APNs result through
 * push receipts. This module handles transport retries and returns structured
 * results; persistence and scheduled receipt checks live in pushDelivery.service.
 */
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const CHUNK_SIZE = 100;
const MAX_HTTP_ATTEMPTS = 4;
const HTTP_TIMEOUT_MS = 15_000;

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  ttl?: number;
}

interface ExpoErrorDetails {
  error?: string;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: ExpoErrorDetails;
}

interface ExpoPushReceipt {
  status: 'ok' | 'error';
  message?: string;
  details?: ExpoErrorDetails;
}

interface ExpoApiError {
  code?: string;
  message?: string;
}

export interface PushSendResult {
  token: string;
  status: 'accepted' | 'error';
  ticketId?: string;
  errorCode?: string;
  errorMessage?: string;
  retryable: boolean;
}

export interface PushReceiptResult {
  status: 'delivered' | 'error' | 'pending';
  errorCode?: string;
  errorMessage?: string;
  retryable: boolean;
}

class ExpoRequestError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
    this.name = 'ExpoRequestError';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(attempt: number): number {
  const exponential = 500 * 2 ** attempt;
  return exponential + Math.floor(Math.random() * 250);
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function isRetryableExpoError(code?: string): boolean {
  return code === 'MessageRateExceeded';
}

async function postExpo<T>(url: string, body: unknown): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_HTTP_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });

      if (!res.ok) {
        const responseText = await res.text().catch(() => '');
        throw new ExpoRequestError(
          `Expo responded with HTTP ${res.status}${responseText ? `: ${responseText}` : ''}`,
          isRetryableStatus(res.status)
        );
      }

      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof ExpoRequestError ? error.retryable : true;
      if (!retryable || attempt === MAX_HTTP_ATTEMPTS - 1) break;
      await delay(retryDelayMs(attempt));
    }
  }

  if (lastError instanceof ExpoRequestError) throw lastError;
  throw new ExpoRequestError(
    lastError instanceof Error ? lastError.message : 'Expo request failed',
    true
  );
}

/**
 * Sends up to any number of messages in Expo-sized chunks. Results preserve the
 * input order so callers can persist the ticket against the correct device.
 */
export async function sendExpoPush(messages: PushMessage[]): Promise<PushSendResult[]> {
  const results: PushSendResult[] = [];

  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    try {
      const json = await postExpo<{ data?: ExpoPushTicket[]; errors?: ExpoApiError[] }>(
        EXPO_PUSH_URL,
        chunk
      );
      const tickets = json.data;
      if (!Array.isArray(tickets)) {
        const message = json.errors?.map((error) => error.message).filter(Boolean).join('; ')
          || 'Expo returned no push tickets';
        throw new ExpoRequestError(message, true);
      }

      chunk.forEach((message, index) => {
        const ticket = tickets[index];
        if (ticket?.status === 'ok' && ticket.id) {
          results.push({
            token: message.to,
            status: 'accepted',
            ticketId: ticket.id,
            retryable: false,
          });
          return;
        }

        const errorCode = ticket?.details?.error;
        results.push({
          token: message.to,
          status: 'error',
          errorCode,
          errorMessage: ticket?.message ?? 'Expo rejected the push message',
          retryable: isRetryableExpoError(errorCode),
        });
      });
    } catch (error) {
      const retryable = error instanceof ExpoRequestError ? error.retryable : true;
      const errorMessage = error instanceof Error ? error.message : 'Expo push request failed';
      chunk.forEach((message) => {
        results.push({
          token: message.to,
          status: 'error',
          errorMessage,
          retryable,
        });
      });
    }
  }

  return results;
}

/** Retrieve final FCM/APNs receipts for previously accepted Expo ticket ids. */
export async function getExpoPushReceipts(
  ticketIds: string[]
): Promise<Record<string, PushReceiptResult>> {
  if (!ticketIds.length) return {};

  const json = await postExpo<{
    data?: Record<string, ExpoPushReceipt>;
    errors?: ExpoApiError[];
  }>(EXPO_RECEIPTS_URL, { ids: ticketIds });

  if (!json.data) {
    const message = json.errors?.map((error) => error.message).filter(Boolean).join('; ')
      || 'Expo returned no push receipts';
    throw new ExpoRequestError(message, true);
  }

  return Object.fromEntries(
    ticketIds.map((ticketId) => {
      const receipt = json.data?.[ticketId];
      if (!receipt) {
        return [ticketId, { status: 'pending', retryable: true } satisfies PushReceiptResult];
      }
      if (receipt.status === 'ok') {
        return [ticketId, { status: 'delivered', retryable: false } satisfies PushReceiptResult];
      }
      const errorCode = receipt.details?.error;
      return [
        ticketId,
        {
          status: 'error',
          errorCode,
          errorMessage: receipt.message ?? 'Expo reported a delivery failure',
          retryable: isRetryableExpoError(errorCode),
        } satisfies PushReceiptResult,
      ];
    })
  );
}

/** Expo tokens look like `ExponentPushToken[...]` / `ExpoPushToken[...]`. */
export function isExpoPushToken(token: unknown): token is string {
  return typeof token === 'string' && /^Expo(nent)?PushToken\[.+\]$/.test(token);
}
