import { GEOCODING_SEARCH_URL, WEB_URL } from '@/config/env';
import { get } from '@/shared/api/httpClient';

export interface LocationSuggestion {
  x: number;
  y: number;
  label: string;
}

interface NominatimResult {
  lat?: unknown;
  lon?: unknown;
  display_name?: unknown;
}

interface CachedSearch {
  expiresAt: number;
  results: LocationSuggestion[];
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 200;
const DIRECT_REQUEST_INTERVAL_MS = 1_100;
const cache = new Map<string, CachedSearch>();
const inFlight = new Map<string, Promise<LocationSuggestion[]>>();

let directRequestQueue: Promise<void> = Promise.resolve();
let nextDirectRequestAt = 0;
let retryProxyAt = 0;

const hasArabicText = (value: string) => /[\u0600-\u06ff]/.test(value);
const preferredLanguages = (query: string) => (hasArabicText(query) ? 'ar,en' : 'en,ar');

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

function scheduleDirectRequest<T>(task: () => Promise<T>): Promise<T> {
  const run = directRequestQueue.then(async () => {
    const delay = Math.max(0, nextDirectRequestAt - Date.now());
    if (delay > 0) await wait(delay);
    nextDirectRequestAt = Date.now() + DIRECT_REQUEST_INTERVAL_MS;
    return task();
  });

  directRequestQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function parseNominatimResults(payload: unknown): LocationSuggestion[] {
  if (!Array.isArray(payload)) throw new Error('INVALID_LOCATION_RESPONSE');

  return (payload as NominatimResult[])
    .map((item): LocationSuggestion | null => {
      const x = Number(item.lon);
      const y = Number(item.lat);
      if (!Number.isFinite(x) || !Number.isFinite(y) || typeof item.display_name !== 'string') {
        return null;
      }
      return { x, y, label: item.display_name };
    })
    .filter((item): item is LocationSuggestion => item !== null)
    .slice(0, 8);
}

async function searchDirectly(query: string): Promise<LocationSuggestion[]> {
  return scheduleDirectRequest(async () => {
    const languages = preferredLanguages(query);
    const url = new URL(GEOCODING_SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('accept-language', languages);
    url.searchParams.set('countrycodes', 'eg');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'Accept-Language': languages,
          'User-Agent': `BtLee/1.0 (${WEB_URL})`,
        },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('LOCATION_SEARCH_FAILED');
      return parseNominatimResults(await response.json());
    } finally {
      clearTimeout(timeout);
    }
  });
}

async function searchWithFallback(query: string): Promise<LocationSuggestion[]> {
  if (Date.now() >= retryProxyAt) {
    try {
      return await get<LocationSuggestion[]>('/locations/search', {
        params: { q: query },
        timeout: 6_000,
      });
    } catch {
      // Avoid repeating a known-broken proxy request for every user search.
      // The app retries it later so a newly deployed backend is picked up.
      retryProxyAt = Date.now() + 5 * 60 * 1_000;
    }
  }
  return searchDirectly(query);
}

export const locationsApi = {
  search: (query: string): Promise<LocationSuggestion[]> => {
    const trimmedQuery = query.trim();
    const key = `${preferredLanguages(trimmedQuery)}:${trimmedQuery.toLocaleLowerCase()}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.results);
    if (cached) cache.delete(key);

    const existingRequest = inFlight.get(key);
    if (existingRequest) return existingRequest;

    const request = searchWithFallback(trimmedQuery)
      .then((results) => {
        if (cache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey) cache.delete(oldestKey);
        }
        cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, results });
        return results;
      })
      .finally(() => {
        inFlight.delete(key);
      });

    inFlight.set(key, request);
    return request;
  },
};
