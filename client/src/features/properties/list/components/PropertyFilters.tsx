'use client';
/**
 * Property filters panel — pure controlled component.
 * The parent owns the FilterState and updates apply live (no Apply button).
 */
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import {
  PROPERTY_TYPES,
  PROPERTY_CATEGORIES,
  FINISHING_TYPES,
  LISTING_TYPES,
  GOVERNORATES,
} from '@/shared/lib/constants';

export interface FilterState {
  listingType?: string;
  type?: string;
  category?: string;
  governorate?: string;
  minPrice?: string;
  maxPrice?: string;
  minBedrooms?: string;
  minArea?: string;
  finishing?: string;
}

interface PropertyFiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
}

const ANY = '__any__';

export function PropertyFilters({ value, onChange, onClear }: PropertyFiltersProps) {
  const t = useTranslations('filters');
  const tProp = useTranslations('property');
  const tc = useTranslations('common');
  const anyLabel = tc('all');

  function update<K extends keyof FilterState>(key: K, v: FilterState[K] | typeof ANY) {
    onChange({ ...value, [key]: !v || v === ANY ? undefined : v });
  }

  const hasAny = Object.values(value).some((v) => v !== undefined && v !== '');

  return (
    <Card className="border-border bg-card p-5 sticky top-20">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Filter className="size-4" />
          {t('title')}
        </h3>
        {hasAny && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="size-3" />
            {t('clear')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t('listingType')}</Label>
          <Select
            value={value.listingType ?? ANY}
            onValueChange={(v) => update('listingType', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{anyLabel}</SelectItem>
              {LISTING_TYPES.map((lt) => (
                <SelectItem key={lt} value={lt}>
                  {tProp(`listingTypes.${lt}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t('type')}</Label>
          <Select value={value.type ?? ANY} onValueChange={(v) => update('type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{anyLabel}</SelectItem>
              {PROPERTY_TYPES.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {tProp(`types.${tp}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t('category')}</Label>
          <Select value={value.category ?? ANY} onValueChange={(v) => update('category', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{anyLabel}</SelectItem>
              {PROPERTY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {tProp(`categories.${c}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t('governorate')}</Label>
          <Select
            value={value.governorate ?? ANY}
            onValueChange={(v) => update('governorate', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={ANY}>{anyLabel}</SelectItem>
              {GOVERNORATES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t('price')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder={t('minPrice')}
              value={value.minPrice ?? ''}
              onChange={(e) => update('minPrice', e.target.value)}
            />
            <Input
              type="number"
              inputMode="numeric"
              placeholder={t('maxPrice')}
              value={value.maxPrice ?? ''}
              onChange={(e) => update('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t('minBedrooms')}</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={value.minBedrooms ?? ''}
            onChange={(e) => update('minBedrooms', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            {t('minArea')} ({tProp('areaUnit')})
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            value={value.minArea ?? ''}
            onChange={(e) => update('minArea', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('finishing')}</Label>
          <Select
            value={value.finishing ?? ANY}
            onValueChange={(v) => update('finishing', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{anyLabel}</SelectItem>
              {FINISHING_TYPES.map((f) => (
                <SelectItem key={f} value={f}>
                  {tProp(`finishing.${f}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
