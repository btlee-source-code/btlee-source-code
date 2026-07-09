/**
 * Shared Leaflet default marker icon.
 *
 * Leaflet's built-in icon paths don't survive bundling (Webpack/Turbopack), so
 * we build an explicit icon from the package's bundled PNGs and pass it to every
 * <Marker icon={markerIcon} />. Static image imports may resolve to either a
 * URL string or a `{ src }` object depending on the bundler, so `toUrl` handles
 * both.
 */
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

function toUrl(img: unknown): string {
  return typeof img === 'string' ? img : (img as { src: string }).src;
}

export const defaultMarkerIcon = L.icon({
  iconRetinaUrl: toUrl(markerIcon2x),
  iconUrl: toUrl(markerIcon),
  shadowUrl: toUrl(markerShadow),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  tooltipAnchor: [16, -28],
});
