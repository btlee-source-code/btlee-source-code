import { useState } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { S } from '@/config/strings';

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
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var marker = ${hasInitial} ? L.marker([${lat}, ${lng}]).addTo(map) : null;
    map.on('click', function (e) {
      if (marker) { marker.setLatLng(e.latlng); } else { marker = L.marker(e.latlng).addTo(map); }
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
    });
  </script>
</body>
</html>`;
}

/**
 * Optional map location picker. Tapping the map drops/moves a pin and reports
 * the coordinate back as [lng, lat] (GeoJSON order, matching the server). The
 * HTML is frozen at first render so a tap (which updates `value`) doesn't reload
 * the map — the marker moves inside the WebView instead.
 */
export function LocationPicker({
  value,
  onChange,
  emptyHint = S.tapToSetLocation,
}: {
  value?: [number, number];
  onChange: (c: [number, number]) => void;
  /** Context-specific instruction; cars and properties share the same map. */
  emptyHint?: string;
}) {
  const [html] = useState(() => buildHtml(value));

  return (
    <View className="gap-1.5">
      <View className="rounded-xl overflow-hidden border border-border" style={{ height: 220 }}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          nestedScrollEnabled
          onMessage={(e) => {
            try {
              const d = JSON.parse(e.nativeEvent.data);
              if (typeof d.lat === 'number' && typeof d.lng === 'number') onChange([d.lng, d.lat]);
            } catch {
              // ignore malformed messages
            }
          }}
          style={{ flex: 1 }}
        />
      </View>
      <Text className={`text-xs font-cairo text-right ${value ? 'text-primary' : 'text-muted-foreground'}`}>
        {value ? S.locationSelected : emptyHint}
      </Text>
    </View>
  );
}
