import { MapPin } from 'lucide-react-native';
import { Linking, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { S } from '@/config/strings';

const PRIMARY = '#1A3C34';

/**
 * Static Leaflet/OpenStreetMap preview (no API key). Dragging/zoom are disabled
 * so the embedded map never fights the outer ScrollView; a "view on map" button
 * opens the full interactive map in the device's maps app.
 *
 * NOTE: `coordinates` are GeoJSON [lng, lat]; Leaflet wants [lat, lng].
 */
export function PropertyMap({ lng, lat }: { lng: number; lat: number }) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{margin:0;height:100%;width:100%;background:#e5e7eb}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {
      zoomControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false, touchZoom: false
    }).setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.marker([${lat}, ${lng}]).addTo(map);
  </script>
</body>
</html>`;

  const openExternal = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`).catch(() => {});
  };

  return (
    <View className="gap-2 pt-4 border-t border-border">
      <Text className="text-base font-cairo-bold text-foreground text-right">{S.locationLabel}</Text>
      <View className="rounded-xl overflow-hidden border border-border" style={{ height: 200 }}>
        <WebView originWhitelist={['*']} source={{ html }} scrollEnabled={false} style={{ flex: 1 }} />
      </View>
      <Pressable
        onPress={openExternal}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-border h-11 active:bg-secondary">
        <MapPin size={16} color={PRIMARY} />
        <Text className="text-sm font-cairo-semibold text-primary">{S.viewOnMap}</Text>
      </Pressable>
    </View>
  );
}
