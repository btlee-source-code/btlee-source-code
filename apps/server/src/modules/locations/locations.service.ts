import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';

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

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const UPSTREAM_INTERVAL_MS = 1_100;
const cache = new Map<string, CachedSearch>();
const inFlight = new Map<string, Promise<LocationSuggestion[]>>();

let upstreamQueue: Promise<void> = Promise.resolve();
let nextUpstreamRequestAt = 0;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const hasArabicText = (value: string) => /[\u0600-\u06ff]/.test(value);
const preferredLanguages = (query: string) => (hasArabicText(query) ? 'ar,en' : 'en,ar');

/**
 * Serializes uncached upstream requests and keeps their start times over one
 * second apart, matching the public Nominatim usage limit.
 */
function scheduleUpstream<T>(task: () => Promise<T>): Promise<T> {
  const run = upstreamQueue.then(async () => {
    const delay = Math.max(0, nextUpstreamRequestAt - Date.now());
    if (delay > 0) await wait(delay);
    nextUpstreamRequestAt = Date.now() + UPSTREAM_INTERVAL_MS;
    return task();
  });

  upstreamQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function cacheResults(key: string, results: LocationSuggestion[]): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, results });
}

async function requestLocations(query: string): Promise<LocationSuggestion[]> {
  return scheduleUpstream(async () => {
    const languages = preferredLanguages(query);
    const url = new URL(env.GEOCODING_SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('accept-language', languages);
    url.searchParams.set('countrycodes', 'eg');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');

    let response: globalThis.Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': languages,
          'User-Agent': `BtLee/1.0 (${env.CLIENT_URL})`,
        },
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      throw new AppError('Location search service is unavailable', 502);
    }

    if (!response.ok) {
      throw new AppError('Location search service is unavailable', 502);
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      throw new AppError('Invalid response from location search service', 502);
    }

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
  });
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const trimmedQuery = query.trim();
  const key = `${preferredLanguages(trimmedQuery)}:${trimmedQuery.toLocaleLowerCase()}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.results;
  if (cached) cache.delete(key);

  const existingRequest = inFlight.get(key);
  if (existingRequest) return existingRequest;

  const request = requestLocations(trimmedQuery)
    .then((results) => {
      cacheResults(key, results);
      return results;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}
