/**
 * useFetch — minimal data-fetching hook.
 *
 * Re-runs whenever `key` changes. Pass a stable string (e.g. JSON of the
 * query params) — same key = no re-fetch.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseFetchOptions {
  enabled?: boolean;
  /** Optional stable string that triggers refetch when it changes. */
  key?: string;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  keyOrDepsOrOptions: string | unknown[] | UseFetchOptions = '',
  legacyOptions?: UseFetchOptions
) {
  // Accept three call shapes for convenience:
  //   useFetch(fn, 'stable-key', { enabled })
  //   useFetch(fn, [dep1, dep2], { enabled })   ← stringified internally
  //   useFetch(fn, { enabled, key })
  let key: string;
  let options: UseFetchOptions;
  if (typeof keyOrDepsOrOptions === 'string') {
    key = keyOrDepsOrOptions;
    options = legacyOptions ?? {};
  } else if (Array.isArray(keyOrDepsOrOptions)) {
    key = JSON.stringify(keyOrDepsOrOptions);
    options = legacyOptions ?? {};
  } else {
    key = keyOrDepsOrOptions.key ?? '';
    options = keyOrDepsOrOptions;
  }
  const { enabled = true } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: enabled,
    error: null,
  });

  // Always invoke the latest fetcher without listing it as a dep
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      const data = await fetcherRef.current();
      if (!signal.cancelled) setState({ data, isLoading: false, error: null });
    } catch (error) {
      if (!signal.cancelled) {
        setState({ data: null, isLoading: false, error: error as Error });
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    const signal = { cancelled: false };
    setState((s) => (s.isLoading ? s : { ...s, isLoading: true }));
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [enabled, key, load]);

  const refetch = useCallback(() => {
    const signal = { cancelled: false };
    setState((s) => ({ ...s, isLoading: true }));
    load(signal);
  }, [load]);

  return { ...state, refetch };
}

/**
 * useMutation — minimal mutation hook for POST/PATCH/DELETE actions.
 */
export function useMutation<TInput, TOutput>(
  mutator: (input: TInput) => Promise<TOutput>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function mutate(input: TInput): Promise<TOutput> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutator(input);
      setIsLoading(false);
      return result;
    } catch (e) {
      setError(e as Error);
      setIsLoading(false);
      throw e;
    }
  }

  return { mutate, isLoading, error };
}
