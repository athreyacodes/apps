import { Injectable } from '@angular/core';
import type { WeatherSearchResult } from '@apps/contract-bff';

export const LAST_CITY_STORAGE_KEY = 'apps.weather.lastCity';

function isSearchResult(value: unknown): value is WeatherSearchResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record['id'] === 'number' &&
    typeof record['name'] === 'string' &&
    typeof record['country'] === 'string' &&
    typeof record['lat'] === 'number' &&
    typeof record['lon'] === 'number'
  );
}

@Injectable({ providedIn: 'root' })
export class LastCityStore {
  read(): WeatherSearchResult | null {
    try {
      const raw = localStorage.getItem(LAST_CITY_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      return isSearchResult(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  write(city: WeatherSearchResult): void {
    localStorage.setItem(LAST_CITY_STORAGE_KEY, JSON.stringify(city));
  }
}
