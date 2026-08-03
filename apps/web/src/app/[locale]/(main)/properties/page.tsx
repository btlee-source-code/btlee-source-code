import { getTranslations } from 'next-intl/server';
import { serverApiBase } from '@/config/site';
import type { Property } from '@/shared/types/property';
import PropertiesPageClient from './PropertiesPageClient';

const PAGE_SIZE = 12;
const STRING_FILTERS = [
  'search',
  'listingType',
  'type',
  'category',
  'governorate',
  'finishing',
] as const;
const NUMBER_FILTERS = ['minPrice', 'maxPrice', 'minBedrooms', 'minArea'] as const;
const SORT_OPTIONS = new Set(['newest', 'oldest', 'price_asc', 'price_desc']);

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildPublicQuery(raw: RawSearchParams) {
  const query = new URLSearchParams();

  for (const key of STRING_FILTERS) {
    const value = firstValue(raw[key])?.trim();
    if (value) query.set(key, value);
  }

  for (const key of NUMBER_FILTERS) {
    const value = firstValue(raw[key]);
    if (value && Number.isFinite(Number(value))) query.set(key, value);
  }

  const sort = firstValue(raw.sort);
  if (sort && SORT_OPTIONS.has(sort)) query.set('sort', sort);
  if (firstValue(raw.featured) === 'true') query.set('featured', 'true');

  return query;
}

async function getInitialProperties(query: URLSearchParams): Promise<{
  items: Property[];
  total: number;
  failed: boolean;
}> {
  const apiQuery = new URLSearchParams(query);
  apiQuery.set('page', '1');
  apiQuery.set('limit', String(PAGE_SIZE));

  try {
    const response = await fetch(`${serverApiBase()}/properties?${apiQuery}`, {
      cache: 'no-store',
    });
    if (!response.ok) return { items: [], total: 0, failed: true };

    const json: {
      data?: Property[];
      meta?: { pagination?: { total?: number } };
    } = await response.json();
    const items = json.data ?? [];

    return {
      items,
      total: json.meta?.pagination?.total ?? items.length,
      failed: false,
    };
  } catch {
    return { items: [], total: 0, failed: true };
  }
}

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ locale }, rawSearchParams] = await Promise.all([params, searchParams]);
  const query = buildPublicQuery(rawSearchParams);
  const [initial, t] = await Promise.all([
    getInitialProperties(query),
    getTranslations({ locale, namespace: 'propertiesPage' }),
  ]);

  return (
    <>
      <header className="container mx-auto px-4 pt-8 md:pt-10">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t('title')}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
          {t('description')}
        </p>
      </header>
      <PropertiesPageClient
        initialItems={initial.items}
        initialTotal={initial.total}
        initialSearchParams={query.toString()}
        initialLoadFailed={initial.failed}
      />
    </>
  );
}
