import { useCallback, useEffect, useState } from 'react';

/**
 * Minimal data-fetching hook (mirrors the web `useFetch`). Re-runs when `key`
 * changes and guards against races so a stale response can't overwrite a newer
 * one. No cache — matches the web's lightweight pattern.
 */
export function useFetch<T>(fetcher: () => Promise<T>, key = '') {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const refetch = useCallback(() => setReloadTick((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setError(null);
    fetcher()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(e as Error);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadTick]);

  return { data, isLoading, error, refetch };
}
