'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Check, Loader2, MapPin, Search, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import {
  locationsApi,
  type LocationSuggestion,
} from '@/features/properties/api/locations.api';
import { defaultMarkerIcon } from '../../lib/leafletIcon';

interface LocationPickerProps {
  value: [number, number] | null;
  onChange: (coords: [number, number]) => void;
  onClear?: () => void;
}

const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];

function ClickHandler({ onChange }: { onChange: (coords: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lng, event.latlng.lat]);
    },
  });
  return null;
}

function SearchBox({ onPick }: { onPick: (suggestion: LocationSuggestion) => void }) {
  const t = useTranslations('addProperty.locationSearch');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  async function search() {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setError(t('minimum'));
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const found = await locationsApi.search(trimmedQuery);
      setResults(found);
      setOpen(true);
    } catch {
      setResults([]);
      setOpen(false);
      setError(t('failed'));
    } finally {
      setLoading(false);
    }
  }

  function pick(suggestion: LocationSuggestion) {
    onPick(suggestion);
    setQuery(suggestion.label);
    setResults([]);
    setOpen(false);
    setError(null);
  }

  function clear() {
    setQuery('');
    setResults([]);
    setOpen(false);
    setError(null);
  }

  return (
    <div ref={boxRef} className="relative space-y-1.5">
      <div className="flex min-w-0 gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError(null);
              if (!event.target.value) {
                setResults([]);
                setOpen(false);
              }
            }}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              void search();
            }}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className="h-11 w-full min-w-0 rounded-xl border border-input bg-card ps-10 pe-10 text-sm text-foreground shadow-sm outline-none transition placeholder:text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12 sm:placeholder:text-sm"
          />
          {query && !loading && (
            <button
              type="button"
              onClick={clear}
              className="absolute top-1/2 end-3 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-destructive"
              aria-label={t('clear')}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => void search()}
          disabled={loading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:px-5"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          <span>{t('button')}</span>
        </button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {open && (
        <div className="absolute inset-x-0 top-full z-[1000] mt-1.5">
          {results.length > 0 ? (
            <ul className="max-h-64 overflow-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
              {results.map((result, index) => (
                <li key={`${result.x},${result.y},${index}`}>
                  <button
                    type="button"
                    onClick={() => pick(result)}
                    className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span className="break-words leading-snug">{result.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-border bg-popover px-4 py-3 text-sm text-muted-foreground shadow-lg">
              {t('empty', { query: query.trim() })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LocationPicker({ value, onChange, onClear }: LocationPickerProps) {
  const t = useTranslations('addProperty.locationSearch');
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => setMounted(true), []);

  const center: [number, number] = value ? [value[1], value[0]] : DEFAULT_CENTER;

  function handlePick(suggestion: LocationSuggestion) {
    onChange([suggestion.x, suggestion.y]);
    mapRef.current?.setView([suggestion.y, suggestion.x], 16, { animate: true });
  }

  return (
    <div className="space-y-3">
      <SearchBox onPick={handlePick} />

      <div className="relative isolate h-64 overflow-hidden rounded-2xl border border-border shadow-sm sm:h-80">
        {mounted && (
          <MapContainer
            ref={mapRef}
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onChange={onChange} />
            {value && <Marker position={[value[1], value[0]]} icon={defaultMarkerIcon} />}
          </MapContainer>
        )}

        {mounted && !value && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[500] flex justify-center px-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 text-center text-xs font-medium text-muted-foreground shadow-md backdrop-blur sm:px-4">
              <MapPin className="size-3.5 shrink-0 text-accent" />
              {t('mapHint')}
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-3.5" />
            </span>
            <span className="font-medium text-foreground">{t('selected')}</span>
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline" dir="ltr">
              {value[1].toFixed(5)}, {value[0].toFixed(5)}
            </span>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
              {t('clear')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
