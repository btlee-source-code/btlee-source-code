'use client';
/**
 * Active filter chips — visible summary of what's currently filtering the list.
 * Each chip is clickable to remove that single filter.
 */
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import type { FilterState } from './PropertyFilters';

interface ActiveFilterChipsProps {
  filters: FilterState;
  search: string;
  onRemove: (key: keyof FilterState | 'search') => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  search,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  const t = useTranslations('filters');
  const tProp = useTranslations('property');
  const tc = useTranslations('common');

  const chips: { key: keyof FilterState | 'search'; label: string }[] = [];

  if (search.trim()) {
    chips.push({ key: 'search', label: `"${search.trim()}"` });
  }
  if (filters.listingType) {
    chips.push({
      key: 'listingType',
      label: tProp(`listingTypes.${filters.listingType}` as never),
    });
  }
  if (filters.type) {
    chips.push({ key: 'type', label: tProp(`types.${filters.type}` as never) });
  }
  if (filters.category) {
    chips.push({
      key: 'category',
      label: tProp(`categories.${filters.category}` as never),
    });
  }
  if (filters.governorate) {
    chips.push({ key: 'governorate', label: filters.governorate });
  }
  if (filters.minPrice) {
    chips.push({
      key: 'minPrice',
      label: `${t('minPrice')}: ${Number(filters.minPrice).toLocaleString()}`,
    });
  }
  if (filters.maxPrice) {
    chips.push({
      key: 'maxPrice',
      label: `${t('maxPrice')}: ${Number(filters.maxPrice).toLocaleString()}`,
    });
  }
  if (filters.minBedrooms) {
    chips.push({
      key: 'minBedrooms',
      label: `${tProp('bedrooms')}: ≥ ${filters.minBedrooms}`,
    });
  }
  if (filters.minArea) {
    chips.push({
      key: 'minArea',
      label: `${tProp('area')}: ≥ ${filters.minArea} ${tProp('areaUnit')}`,
    });
  }
  if (filters.finishing) {
    chips.push({
      key: 'finishing',
      label: tProp(`finishing.${filters.finishing}` as never),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition-colors"
        >
          <span>{chip.label}</span>
          <X className="size-3.5 opacity-60 group-hover:opacity-100" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-2"
        >
          {tc('all')} — {t('clear')}
        </button>
      )}
    </div>
  );
}
