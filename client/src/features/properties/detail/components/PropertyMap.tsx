'use client';
/**
 * OpenStreetMap (Leaflet) embed showing the property location with a pin.
 * Uses the free OSM tile server — no API key or billing required.
 */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { defaultMarkerIcon } from '../../lib/leafletIcon';

interface PropertyMapProps {
  lng: number;
  lat: number;
  height?: string;
}

export function PropertyMap({ lng, lat, height = '400px' }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ height }} className="rounded-xl border border-border bg-secondary/50" />
    );
  }

  return (
    <div style={{ height }} className="isolate overflow-hidden rounded-2xl border border-border shadow-sm">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={defaultMarkerIcon} />
      </MapContainer>
    </div>
  );
}
