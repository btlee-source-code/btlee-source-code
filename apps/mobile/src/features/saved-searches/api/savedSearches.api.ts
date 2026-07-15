import { del, get, post } from '@/shared/api/httpClient';

/** A saved search — note the model stores NO `finishing`/`sort` (drop them on save). */
export interface SavedSearch {
  _id: string;
  name: string;
  search: string | null;
  type: string | null;
  listingType: string | null;
  category: string | null;
  governorate: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  minArea: number | null;
  createdAt: string;
}

/** Create payload — send only the fields that are set (empty enums fail validation). */
export interface SavedSearchInput {
  name: string;
  search?: string;
  type?: string;
  listingType?: string;
  category?: string;
  governorate?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minArea?: number;
}

/** A saved CAR search — car-shaped criteria (parallel to the property shape). */
export interface CarSavedSearch {
  _id: string;
  name: string;
  search: string | null;
  listingType: string | null;
  governorate: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  condition: string | null;
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  minYear: number | null;
  maxYear: number | null;
  maxMileage: number | null;
  createdAt: string;
}

export interface CarSavedSearchInput {
  name: string;
  search?: string;
  listingType?: string;
  governorate?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
}

export const savedSearchesApi = {
  list: () => get<SavedSearch[]>('/saved-searches?targetType=property'),
  create: (body: SavedSearchInput) => post<SavedSearch>('/saved-searches', body),
  remove: (id: string) => del<{ message: string }>(`/saved-searches/${id}`),

  // Cars
  listCars: () => get<CarSavedSearch[]>('/saved-searches?targetType=car'),
  createCar: (body: CarSavedSearchInput) => post<CarSavedSearch>('/saved-searches/car', body),
};
