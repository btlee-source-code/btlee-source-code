import { Check, MapPin, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { S } from '@/config/strings';
import { useThemeColors } from '@/features/theme/hooks/useTheme';
import { AppTextInput } from '@/shared/components/ui/AppTextInput';
import { locationsApi, type LocationSuggestion } from '../api/locations.api';

// Default map center: Cairo.
const CAIRO = { lat: 30.0444, lng: 31.2357 };

/** Builds the interactive Leaflet HTML. `value` is [lng, lat] (GeoJSON order). */
function buildHtml(value?: [number, number]): string {
  const lat = value ? value[1] : CAIRO.lat;
  const lng = value ? value[0] : CAIRO.lng;
  const zoom = value ? 15 : 11;
  const hasInitial = value ? 'true' : 'false';
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{margin:0;height:100%;width:100%}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([${lat}, ${lng}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    var marker = ${hasInitial} ? L.marker([${lat}, ${lng}]).addTo(map) : null;

    function setMarker(lat, lng, centerMap) {
      var point = L.latLng(lat, lng);
      if (marker) { marker.setLatLng(point); } else { marker = L.marker(point).addTo(map); }
      if (centerMap) map.setView(point, 16, { animate: true });
    }

    window.setSelectedLocation = function (lat, lng) {
      setMarker(lat, lng, true);
    };
    window.clearSelectedLocation = function () {
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
    };

    map.on('click', function (e) {
      setMarker(e.latlng.lat, e.latlng.lng, false);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }));
    });
  </script>
</body>
</html>`;
}

/**
 * Optional map location picker shared by car and property forms.
 *
 * Search mirrors the web flow (Arabic Nominatim results restricted to Egypt),
 * while requests are explicit rather than sent for every keystroke.
 */
export function LocationPicker({
  value,
  onChange,
  emptyHint = S.tapToSetLocation,
}: {
  value?: [number, number];
  onChange: (coordinates?: [number, number]) => void;
  /** Context-specific instruction; cars and properties share the same map. */
  emptyHint?: string;
}) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const compactSearch = width < 380;
  const webViewRef = useRef<WebView>(null);
  const requestIdRef = useRef(0);
  const [html] = useState(() => buildHtml(value));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
    },
    []
  );

  const moveMapTo = (coordinates: [number, number]) => {
    const [lng, lat] = coordinates;
    webViewRef.current?.injectJavaScript(
      `window.setSelectedLocation && window.setSelectedLocation(${lat}, ${lng}); true;`
    );
  };

  const runSearch = async () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
      setResults([]);
      setResultsOpen(false);
      setSearchError(S.locationSearchMinChars);
      return;
    }

    const requestId = ++requestIdRef.current;
    Keyboard.dismiss();
    setSearching(true);
    setSearchError(null);
    setResultsOpen(false);

    try {
      const found = await locationsApi.search(trimmedQuery);
      if (requestId !== requestIdRef.current) return;
      setResults(found);
      setResultsOpen(true);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setResultsOpen(false);
      setSearchError(S.locationSearchFailed);
    } finally {
      if (requestId === requestIdRef.current) setSearching(false);
    }
  };

  const clearSearch = () => {
    requestIdRef.current += 1;
    setQuery('');
    setResults([]);
    setResultsOpen(false);
    setSearching(false);
    setSearchError(null);
  };

  const pickSuggestion = (suggestion: LocationSuggestion) => {
    const coordinates: [number, number] = [suggestion.x, suggestion.y];
    setQuery(suggestion.label);
    setResults([]);
    setResultsOpen(false);
    setSearchError(null);
    onChange(coordinates);
    moveMapTo(coordinates);
  };

  const clearLocation = () => {
    onChange(undefined);
    webViewRef.current?.injectJavaScript(
      'window.clearSelectedLocation && window.clearSelectedLocation(); true;'
    );
  };

  return (
    <View className="gap-3">
      <View className="gap-1.5">
        <View
          className="flex-row items-center bg-secondary border border-border rounded-xl h-12"
          style={{ paddingHorizontal: compactSearch ? 8 : 12 }}>
          <Search size={compactSearch ? 16 : 18} color={c.muted} />
          <AppTextInput
            value={query}
            onChangeText={(text) => {
              requestIdRef.current += 1;
              setQuery(text);
              setResults([]);
              setResultsOpen(false);
              setSearching(false);
              setSearchError(null);
            }}
            onFocus={() => {
              if (results.length > 0) setResultsOpen(true);
            }}
            onSubmitEditing={runSearch}
            returnKeyType="search"
            maxLength={100}
            placeholder={S.locationSearchPlaceholder}
            placeholderTextColor={c.muted}
            className="flex-1 text-foreground font-cairo text-right"
            style={{
              minWidth: 0,
              marginHorizontal: compactSearch ? 5 : 8,
              fontSize: compactSearch ? 12 : 13,
              lineHeight: 20,
            }}
            textAlign="right"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={clearSearch}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={S.clearLocationSearch}>
              <X size={17} color={c.muted} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={runSearch}
            disabled={searching}
            accessibilityRole="button"
            accessibilityLabel={S.locationSearchAction}
            className="h-8 rounded-lg bg-primary items-center justify-center active:opacity-80 disabled:opacity-60"
            style={{
              minWidth: compactSearch ? 44 : 54,
              marginLeft: compactSearch ? 4 : 8,
              paddingHorizontal: compactSearch ? 6 : 8,
            }}>
            {searching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.1}
                className="text-[11px] text-white font-cairo-bold">
                {S.locationSearchAction}
              </Text>
            )}
          </Pressable>
        </View>

        {searchError ? (
          <Text
            accessibilityLiveRegion="polite"
            className="text-xs leading-5 text-destructive font-cairo-semibold text-right">
            {searchError}
          </Text>
        ) : null}

        {resultsOpen ? (
          results.length > 0 ? (
            <View className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <ScrollView
                style={{ maxHeight: 260 }}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {results.map((result, index) => (
                  <View key={`${result.x},${result.y},${index}`}>
                    {index > 0 ? <View className="h-px bg-border/60 mx-3" /> : null}
                    <Pressable
                      onPress={() => pickSuggestion(result)}
                      className="flex-row items-start gap-2.5 px-3 py-3 active:bg-secondary">
                      <MapPin size={17} color={c.accent} style={{ marginTop: 2 }} />
                      <Text className="flex-1 text-sm leading-6 text-foreground font-cairo text-right">
                        {result.label}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
              <Text className="px-3 py-2 text-[10px] text-muted-foreground font-cairo text-right border-t border-border/60">
                {S.locationSearchAttribution}
              </Text>
            </View>
          ) : (
            <View className="rounded-xl border border-border bg-card px-4 py-3">
              <Text className="text-sm text-muted-foreground font-cairo text-right">
                {S.locationSearchNoResults(query.trim())}
              </Text>
            </View>
          )
        ) : null}
      </View>

      <View className="rounded-xl overflow-hidden border border-border" style={{ height: 220 }}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html }}
          nestedScrollEnabled
          onLoadEnd={() => {
            if (value) moveMapTo(value);
          }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data) as { lat?: unknown; lng?: unknown };
              if (typeof data.lat === 'number' && typeof data.lng === 'number') {
                onChange([data.lng, data.lat]);
              }
            } catch {
              // Ignore malformed WebView messages.
            }
          }}
          style={{ flex: 1 }}
        />
      </View>

      {value ? (
        <View className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 gap-1.5">
          <View className="flex-row items-center justify-end gap-2">
            <Text className="text-sm text-foreground font-cairo-semibold">
              {S.locationSelected}
            </Text>
            <View className="h-6 w-6 rounded-full bg-primary/10 items-center justify-center">
              <Check size={15} color={c.primary} />
            </View>
          </View>
          <View className="flex-row items-center justify-between gap-3">
            <Pressable
              onPress={clearLocation}
              className="flex-row items-center gap-1 px-2 py-1 rounded-lg active:bg-destructive/10">
              <X size={14} color={c.destructive} />
              <Text className="text-xs text-destructive font-cairo-semibold">{S.clearLocation}</Text>
            </Pressable>
            <Text className="flex-1 text-xs text-muted-foreground text-right" style={{ writingDirection: 'ltr' }}>
              {value[1].toFixed(5)}, {value[0].toFixed(5)}
            </Text>
          </View>
        </View>
      ) : (
        <Text className="text-xs text-muted-foreground font-cairo text-right">{emptyHint}</Text>
      )}
    </View>
  );
}
