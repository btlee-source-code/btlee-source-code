'use client';
/**
 * Properties listing page — live search + sidebar filters + grid.
 *
 * Every change to search/filters fires immediately (debounced for typing) —
 * no Apply button. URL stays in sync so the page is shareable.
 */
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import {
  PropertyFilters,
  type FilterState,
} from '@/features/properties/list/components/PropertyFilters';
import { ActiveFilterChips } from '@/features/properties/list/components/ActiveFilterChips';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { propertiesApi, type PropertyListParams } from '@/features/properties/api/properties.api';
import type { Property } from '@/shared/types/property';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

// How many listings load per page / per "show more" click.
const PAGE_SIZE = 12;

function readFiltersFromUrl(params: URLSearchParams): FilterState {
  return {
    listingType: params.get('listingType') ?? undefined,
    type: params.get('type') ?? undefined,
    category: params.get('category') ?? undefined,
    governorate: params.get('governorate') ?? undefined,
    minPrice: params.get('minPrice') ?? undefined,
    maxPrice: params.get('maxPrice') ?? undefined,
    minBedrooms: params.get('minBedrooms') ?? undefined,
    minArea: params.get('minArea') ?? undefined,
    finishing: params.get('finishing') ?? undefined,
  };
}

function PropertiesContent() {
  const t = useTranslations('filters');
  const tc = useTranslations('common');
  const tErr = useTranslations('errors');
  const tNav = useTranslations('nav');
  const searchParams = useSearchParams();
  const router = useRouter();

  usePageTitle(tNav('properties'));

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(search, 300);

  const [sort, setSort] = useState<NonNullable<PropertyListParams['sort']>>(
    (searchParams.get('sort') as NonNullable<PropertyListParams['sort']>) ?? 'newest',
  );

  const [filters, setFilters] = useState<FilterState>(() =>
    readFiltersFromUrl(searchParams),
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Keep URL in sync — debounced via search, immediate for filters/sort.
  const skipNextUrlSyncRef = useRef(false);
  useEffect(() => {
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }
    const next = new URLSearchParams();
    if (debouncedSearch.trim()) next.set('search', debouncedSearch.trim());
    Object.entries(filters).forEach(([k, v]) => {
      if (v) next.set(k, v);
    });
    if (sort && sort !== 'newest') next.set('sort', sort);
    const featured = searchParams.get('featured');
    if (featured) next.set('featured', featured);

    const str = next.toString();
    const current = searchParams.toString();
    if (str !== current) {
      router.replace(str ? `?${str}` : '?', { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters, sort]);

  // Sync from URL when navigating (browser back/forward, or external link).
  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    if (urlSearch !== debouncedSearch) {
      skipNextUrlSyncRef.current = true;
      setSearch(urlSearch);
    }
    const urlFilters = readFiltersFromUrl(searchParams);
    setFilters((prev) => {
      const same =
        prev.listingType === urlFilters.listingType &&
        prev.type === urlFilters.type &&
        prev.category === urlFilters.category &&
        prev.governorate === urlFilters.governorate &&
        prev.minPrice === urlFilters.minPrice &&
        prev.maxPrice === urlFilters.maxPrice &&
        prev.minBedrooms === urlFilters.minBedrooms &&
        prev.minArea === urlFilters.minArea &&
        prev.finishing === urlFilters.finishing;
      return same ? prev : urlFilters;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Build the actual API params from debounced state.
  const apiParams = useMemo<PropertyListParams>(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      sort,
      listingType: filters.listingType,
      type: filters.type,
      category: filters.category,
      governorate: filters.governorate,
      finishing: filters.finishing,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minBedrooms: filters.minBedrooms ? Number(filters.minBedrooms) : undefined,
      minArea: filters.minArea ? Number(filters.minArea) : undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sort, filters, searchParams.get('featured')]);

  // Paginated results with a "show more" button. Changing search/filters/sort
  // resets to page 1; the button fetches the next page and appends. `total` is
  // the real match count (not just the current page), so the header count is
  // accurate and "الكل" no longer appears capped at the first 12.
  const [items, setItems] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const queryKey = JSON.stringify(apiParams);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    propertiesApi
      .listPaged({ ...apiParams, page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setPage(1);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e as Error);
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, reloadToken]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const res = await propertiesApi.listPaged({
        ...apiParams,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setItems((prev) => [...prev, ...res.items]);
      setTotal(res.total);
      setPage(nextPage);
    } catch {
      // Keep what we already have — the user can click again to retry.
    } finally {
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, page]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  const clearAll = useCallback(() => {
    setSearch('');
    setFilters({});
    setSort('newest');
  }, []);

  const removeOne = useCallback(
    (key: keyof FilterState | 'search') => {
      if (key === 'search') setSearch('');
      else setFilters((f) => ({ ...f, [key]: undefined }));
    },
    [],
  );

  const resultsCount = total;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tc('search') + '...'}
            className="h-14 ps-11 pe-11 text-base shadow-sm border-border focus-visible:ring-2 focus-visible:ring-primary"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={tc('cancel')}
              className="absolute end-3 top-1/2 -translate-y-1/2 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter trigger */}
      <div className="flex items-center justify-between gap-3 lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen((o) => !o)}
          className="flex-1"
        >
          <SlidersHorizontal className="size-4" />
          {t('title')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <PropertyFilters value={filters} onChange={setFilters} onClear={clearAll} />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute inset-y-0 end-0 w-[85%] max-w-sm bg-background overflow-y-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label={tc('close')}
                className="mb-3 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
              <PropertyFilters
                value={filters}
                onChange={setFilters}
                onClear={clearAll}
              />
            </div>
          </div>
        )}

        <div className="min-w-0">
          {/* Active chips */}
          <ActiveFilterChips
            filters={filters}
            search={search}
            onRemove={removeOne}
            onClearAll={clearAll}
          />

          {/* Results header */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? tc('loading')
                : t('resultsCount', { count: resultsCount })}
            </p>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as NonNullable<PropertyListParams['sort']>)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="oldest">{t('oldest')}</SelectItem>
                <SelectItem value="price_asc">{t('priceAsc')}</SelectItem>
                <SelectItem value="price_desc">{t('priceDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            // Distinct from the empty state: a backend/network failure is NOT
            // "no results" — offer a retry instead of misleading the user.
            <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-12 sm:p-16 text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">{tErr('loadFailed')}</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                {tErr('loadFailedDesc')}
              </p>
              <Button variant="outline" onClick={refetch}>
                {tc('retry')}
              </Button>
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {items.map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
              {items.length < total && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? tc('loading') : tc('showMore')}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 sm:p-16 text-center">
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
                <Search className="size-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {tc('noResults')}
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                {tErr('notFoundDesc')}
              </p>
              {(search || Object.values(filters).some(Boolean)) && (
                <Button variant="outline" onClick={clearAll}>
                  {t('clear')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const tc = useTranslations('common');
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-8 text-muted-foreground">
          {tc('loading')}
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
