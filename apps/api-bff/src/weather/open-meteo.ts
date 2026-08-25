import { FORECAST_URL, GEOCODING_URL } from './constants';

export class UpstreamError extends Error {
  constructor(message = 'Upstream weather provider failed') {
    super(message);
    this.name = 'UpstreamError';
  }
}

export type UpstreamClient = {
  search: (q: string) => Promise<unknown>;
  forecast: (lat: number, lon: number) => Promise<unknown>;
};

export function createOpenMeteoClient(fetchImpl: typeof fetch, timeoutMs: number): UpstreamClient {
  async function getJson(url: URL): Promise<unknown> {
    let response: Response;
    try {
      response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      throw new UpstreamError();
    }
    if (!response.ok) {
      throw new UpstreamError();
    }
    try {
      return await response.json();
    } catch {
      throw new UpstreamError();
    }
  }

  return {
    search(q: string) {
      const url = new URL(GEOCODING_URL);
      url.searchParams.set('name', q);
      url.searchParams.set('count', '8');
      url.searchParams.set('language', 'en');
      url.searchParams.set('format', 'json');
      return getJson(url);
    },
    forecast(lat: number, lon: number) {
      const url = new URL(FORECAST_URL);
      url.searchParams.set('latitude', String(lat));
      url.searchParams.set('longitude', String(lon));
      url.searchParams.set(
        'current',
        'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      );
      url.searchParams.set(
        'daily',
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
      );
      url.searchParams.set('timezone', 'auto');
      url.searchParams.set('forecast_days', '7');
      return getJson(url);
    },
  };
}
