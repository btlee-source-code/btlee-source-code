'use client';
/**
 * Hero search — input + suggestions + a compact, horizontal advanced-filter
 * bar (pills that open small popovers), modelled on classic real-estate
 * filter bars.
 *
 * Behaviour:
 *   • types → debounced 250ms → fetch suggestions (shown above the filter bar)
 *   • the filter pills (type / beds / price / area) are always visible while
 *     the dropdown is open; each opens a small popover to pick a value
 *   • keyboard arrows + Enter pick a suggestion; Esc closes
 *   • click outside closes — but clicks inside a Radix popover are ignored
 *   • submitting merges the typed query + active tab + all filters into one
 *     /properties URL
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Search,
  MapPin,
  Home as HomeIcon,
  ArrowUpLeft,
  Loader2,
  ChevronDown,
  Building2,
  BedDouble,
  Tag,
  Maximize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/config/navigation';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { propertiesApi, type SuggestionsResponse } from '@/features/properties/api/properties.api';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { PROPERTY_TYPES, type PropertyType } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';

type Tab = 'all' | 'sale' | 'rent' | 'commercial';

interface SearchAutocompleteProps {
  activeTab: Tab;
}

interface FlatItem {
  key: string;
  label: string;
  sublabel?: string;
  href: string;
  kind: 'area' | 'governorate' | 'property';
  image?: string | null;
}

const BEDROOM_OPTIONS = [null, 1, 2, 3, 4, 5] as const;

export function SearchAutocomplete({ activeTab }: SearchAutocompleteProps) {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const tProp = useTranslations('property');
  const router = useRouter();
  const listboxId = useId();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [data, setData] = useState<SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Advanced filter state
  const [type, setType] = useState<PropertyType | null>(null);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');

  const debouncedQuery = useDebounce(query, 250);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  // Fetch suggestions whenever the debounced query changes.
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData(null);
      setLoading(false);
      return;
    }
    const requestId = ++requestIdRef.current;
    setLoading(true);
    propertiesApi
      .suggestions(debouncedQuery.trim())
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setData(res);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setData(null);
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [debouncedQuery]);

  // Close on click outside — but ignore clicks inside Radix popovers (the
  // filter dropdowns render in a portal outside this container).
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-radix-popper-content-wrapper]')) return;
      if (!containerRef.current?.contains(target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Flatten suggestions into a single keyboard-navigable list.
  const flatItems = useMemo<FlatItem[]>(() => {
    if (!data) return [];
    const arr: FlatItem[] = [];
    for (const item of data.items) {
      arr.push({
        key: `s-${item.kind}-${item.label}`,
        label: item.label,
        sublabel: item.sublabel,
        href: item.href,
        kind: item.kind,
      });
    }
    for (const p of data.properties) {
      arr.push({
        key: `p-${p._id}`,
        label: p.label,
        sublabel: p.sublabel,
        href: `/properties/${p._id}`,
        kind: 'property',
        image: p.image,
      });
    }
    return arr;
  }, [data]);

  useEffect(() => {
    setHighlight(-1);
  }, [flatItems.length, query]);

  function go(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href as never);
  }

  function buildSearchHref(text: string): string {
    const params = new URLSearchParams();
    if (text.trim()) params.set('search', text.trim());
    if (activeTab === 'sale') params.set('listingType', 'sale');
    if (activeTab === 'rent') params.set('listingType', 'rent');
    if (activeTab === 'commercial') params.set('category', 'commercial');
    if (type) params.set('type', type);
    if (bedrooms != null) params.set('minBedrooms', String(bedrooms));
    const minP = parseInt(minPrice, 10);
    if (!Number.isNaN(minP) && minP > 0) params.set('minPrice', String(minP));
    const maxP = parseInt(maxPrice, 10);
    if (!Number.isNaN(maxP) && maxP > 0) params.set('maxPrice', String(maxP));
    const areaNum = parseInt(minArea, 10);
    if (!Number.isNaN(areaNum) && areaNum > 0) params.set('minArea', String(areaNum));
    return `/properties${params.toString() ? `?${params.toString()}` : ''}`;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (highlight >= 0 && flatItems[highlight]) {
      go(flatItems[highlight].href);
      return;
    }
    go(buildSearchHref(query));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showSuggestions = open && query.trim().length > 0;
  const hasItems = flatItems.length > 0;

  // Pill labels reflect the chosen value (or fall back to the filter name).
  const priceLabel =
    minPrice || maxPrice
      ? [minPrice, maxPrice].filter(Boolean).join(' - ')
      : t('searchFilterPrice');
  const areaLabel = minArea ? `${minArea} ${tProp('areaUnit')}` : t('searchFilterArea');
  const bedroomsLabel =
    bedrooms != null ? `${bedrooms}+` : t('searchFilterBedrooms');
  const typeLabel = type ? tProp(`types.${type}`) : t('searchFilterType');

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute start-3.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
          {loading && (
            <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
          )}
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={t('heroSearchPlaceholder')}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              highlight >= 0 && flatItems[highlight]
                ? `${listboxId}-${flatItems[highlight].key}`
                : undefined
            }
            autoComplete="off"
            className="h-14 pe-10 ps-11 text-base border-0 bg-secondary/50 focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/70"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          variant="accent"
          className="h-14 px-8 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
        >
          <Search className="size-5" />
          {tc('search')}
        </Button>
      </form>

      <AnimatePresence>
        {open && (
          <motion.div
            key="search-dropdown"
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute top-full inset-x-0 sm:end-[7.5rem] mt-2 rounded-2xl bg-card text-foreground shadow-2xl border border-border overflow-hidden z-50"
          >
            {/* Suggestions — only while typing */}
            {showSuggestions && (
              <div className="max-h-[18rem] overflow-y-auto border-b border-border">
                {!hasItems && !loading ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('searchNoMatches')}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(buildSearchHref(query))}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {tc('search')} &quot;{query}&quot;
                    </button>
                  </div>
                ) : (
                  <div className="p-2">
                    {data?.items.map((item, idx) => {
                      const active = highlight === idx;
                      const itemKey = `s-${item.kind}-${item.label}`;
                      return (
                        <button
                          key={itemKey}
                          id={`${listboxId}-${itemKey}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setHighlight(idx)}
                          onClick={() => go(item.href)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start transition-colors',
                            active ? 'bg-primary/10' : 'hover:bg-secondary'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-flex size-8 items-center justify-center rounded-lg flex-shrink-0',
                              item.kind === 'governorate'
                                ? 'bg-accent/15 text-accent'
                                : 'bg-primary/10 text-primary'
                            )}
                          >
                            <MapPin className="size-4" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-foreground truncate">
                              {item.label}
                            </span>
                            {item.sublabel && (
                              <span className="block text-xs text-muted-foreground">
                                {item.sublabel}
                              </span>
                            )}
                          </span>
                          <ArrowUpLeft className="size-4 text-muted-foreground rtl:rotate-90" />
                        </button>
                      );
                    })}

                    {data?.properties.map((p, idx) => {
                      const flatIdx = (data.items?.length ?? 0) + idx;
                      const active = highlight === flatIdx;
                      const itemKey = `p-${p._id}`;
                      return (
                        <button
                          key={itemKey}
                          id={`${listboxId}-${itemKey}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setHighlight(flatIdx)}
                          onClick={() => go(`/properties/${p._id}`)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start transition-colors',
                            active ? 'bg-primary/10' : 'hover:bg-secondary'
                          )}
                        >
                          <span className="relative inline-block size-10 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                            {p.image ? (
                              <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                            ) : (
                              <HomeIcon className="absolute inset-0 m-auto size-5 text-muted-foreground" />
                            )}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-foreground truncate">
                              {p.label}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">
                              {p.sublabel}
                            </span>
                          </span>
                          <span className="text-sm font-bold text-primary whitespace-nowrap">
                            {p.price != null ? p.price.toLocaleString() : tProp('priceOnRequest')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Compact horizontal filter bar — always visible while open */}
            <div className="flex flex-wrap items-center gap-2 p-3">
              {/* Type */}
              <FilterPill icon={Building2} label={typeLabel} active={type != null}>
                <div className="space-y-1">
                  <PillOption
                    label={t('searchAnyType')}
                    active={type == null}
                    onClick={() => setType(null)}
                  />
                  {PROPERTY_TYPES.map((tp) => (
                    <PillOption
                      key={tp}
                      label={tProp(`types.${tp}`)}
                      active={type === tp}
                      onClick={() => setType(tp)}
                    />
                  ))}
                </div>
              </FilterPill>

              {/* Bedrooms */}
              <FilterPill icon={BedDouble} label={bedroomsLabel} active={bedrooms != null}>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  {t('searchBedroomsLabel')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <button
                      key={String(opt ?? 'any')}
                      type="button"
                      onClick={() => setBedrooms(opt)}
                      className={cn(
                        'inline-flex items-center justify-center rounded-full text-xs font-semibold transition-colors min-w-[42px] h-8 px-3',
                        bedrooms === opt
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-foreground hover:bg-secondary/70'
                      )}
                    >
                      {opt === null ? t('searchAnyBedrooms') : `${opt}+`}
                    </button>
                  ))}
                </div>
              </FilterPill>

              {/* Price */}
              <FilterPill icon={Tag} label={priceLabel} active={Boolean(minPrice || maxPrice)}>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  {t('searchFilterPrice')} ({tProp('currency')})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder={t('searchPriceMin')}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder={t('searchPriceMax')}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9"
                  />
                </div>
              </FilterPill>

              {/* Area */}
              <FilterPill icon={Maximize2} label={areaLabel} active={Boolean(minArea)}>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  {t('searchMinAreaLabel')} ({tProp('areaUnit')})
                </p>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder={t('searchMinAreaPlaceholder')}
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="h-9"
                />
              </FilterPill>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A compact filter pill that opens a popover with its options. */
function FilterPill({
  icon: Icon,
  label,
  active,
  children,
}: {
  icon: typeof Building2;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border px-3 h-10 text-sm font-semibold transition-colors',
            active
              ? 'border-primary/40 bg-primary/5 text-primary'
              : 'border-border bg-card text-foreground hover:bg-secondary/60'
          )}
        >
          <Icon className="size-4 shrink-0" />
          <span className="max-w-[120px] truncate">{label}</span>
          <ChevronDown className="size-3.5 opacity-60 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        {children}
      </PopoverContent>
    </Popover>
  );
}

/** A single full-width option row inside a filter popover. */
function PillOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-start rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
      )}
    >
      {label}
    </button>
  );
}
