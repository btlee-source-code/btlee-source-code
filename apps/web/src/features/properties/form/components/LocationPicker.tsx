'use client';
/**
 * OpenStreetMap (Leaflet) location picker.
 * - A branded search box ABOVE the map (Nominatim — free, no API key).
 * - Click the map to drop/adjust the pin.
 * Uses the free OSM tile server — no API key or billing required.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Check, X, Loader2 } from 'lucide-react';
import { defaultMarkerIcon } from '../../lib/leafletIcon';

interface LocationPickerProps {
  value: [number, number] | null; // [lng, lat]
  onChange: (coords: [number, number]) => void;
  onClear?: () => void;
}

interface Suggestion {
  x: number; // lng
  y: number; // lat
  label: string;
}

const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357]; // Cairo [lat, lng]

function ClickHandler({ onChange }: { onChange: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

/** Branded search box (OpenStreetMap's free Nominatim service — no API key). */
function SearchBox({ onPick }: { onPick: (s: Suggestion) => void }) {
  const provider = useMemo(
    () =>
      new OpenStreetMapProvider({
        params: { 'accept-language': 'ar', countrycodes: 'eg', addressdetails: 1 },
      }),
    []
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await provider.search({ query: q });
        setResults(found.map((r) => ({ x: r.x, y: r.y, label: r.label })));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, provider]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function pick(s: Suggestion) {
    onPick(s);
    setQuery(s.label);
    setResults([]);
    setOpen(false);
  }

  const showEmpty = open && !loading && query.trim().length >= 3 && results.length === 0;

  return (
    <div ref={boxRef} className="relative">
      <Search className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      {loading ? (
        <Loader2 className="absolute top-1/2 end-3.5 size-4 -translate-y-1/2 animate-spin text-primary" />
      ) : query ? (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setResults([]);
            setOpen(false);
          }}
          className="absolute top-1/2 end-3 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-destructive"
          aria-label="مسح البحث"
        >
          <X className="size-4" />
        </button>
      ) : null}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="ابحث عن المنطقة أو الحي… (مثال: المعادي، مدينة نصر)"
        className="h-12 w-full rounded-xl border border-input bg-card ps-10 pe-10 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      />

      {open && results.length > 0 && (
        <ul className="absolute z-[1000] mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          {results.map((r, i) => (
            <li key={`${r.x},${r.y},${i}`}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                <span className="leading-snug">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div className="absolute z-[1000] mt-1.5 w-full rounded-xl border border-border bg-popover px-4 py-3 text-sm text-muted-foreground shadow-lg">
          لا توجد نتائج لـ «{query.trim()}»
        </div>
      )}
    </div>
  );
}

export function LocationPicker({ value, onChange, onClear }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mapRef = useRef<L.Map | null>(null);
  const center: [number, number] = value ? [value[1], value[0]] : DEFAULT_CENTER;

  function handlePick(s: Suggestion) {
    onChange([s.x, s.y]);
    mapRef.current?.setView([s.y, s.x], 16, { animate: true });
  }

  return (
    <div className="space-y-3">
      {/* Search box above the map */}
      <SearchBox onPick={handlePick} />

      {/* Map — `isolate` keeps Leaflet's internal z-index (controls = 1000)
          contained so it can't paint over the sticky navbar. */}
      <div className="relative isolate h-80 overflow-hidden rounded-2xl border border-border shadow-sm">
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

        {/* Floating prompt while nothing is picked yet */}
        {mounted && !value && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[500] flex justify-center px-4">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow-md backdrop-blur">
              <MapPin className="size-3.5 text-accent" />
              اضغط على الخريطة لوضع الدبوس
            </div>
          </div>
        )}
      </div>

      {/* Selected-location summary */}
      {value && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-3.5" />
            </span>
            <span className="font-medium text-foreground">تم تحديد الموقع</span>
            <span className="font-mono text-xs text-muted-foreground" dir="ltr">
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
              مسح
            </button>
          )}
        </div>
      )}
    </div>
  );
}
