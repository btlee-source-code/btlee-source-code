/**
 * Shared types used across modules.
 */

export interface CloudinaryImage {
  publicId: string;
  url: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] (GeoJSON order)
}
