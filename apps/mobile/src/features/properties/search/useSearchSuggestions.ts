import { useEffect, useRef, useState } from 'react';

import { useDebounce } from '@/shared/hooks/useDebounce';
import { propertiesApi, type SuggestionsResponse } from '../api/properties.api';

/**
 * Debounced search suggestions with a request-id race guard (fast typing can't
 * render a stale response). Returns null while the query is empty.
 */
export function useSearchSuggestions(query: string) {
  const debounced = useDebounce(query.trim(), 250);
  const [data, setData] = useState<SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (!debounced) {
      setData(null);
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    propertiesApi
      .suggestions(debounced)
      .then((res) => {
        if (id === reqId.current) setData(res);
      })
      .catch(() => {
        if (id === reqId.current) setData(null);
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [debounced]);

  return { data, loading };
}
