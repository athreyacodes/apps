import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { FORECAST_URL, GEOCODING_URL } from './weather/constants';
import { UpstreamError } from './weather/open-meteo';

const geocodeBerlin = {
  results: [
    {
      id: 2950159,
      name: 'Berlin',
      country: 'Germany',
      latitude: 52.52,
      longitude: 13.41,
    },
  ],
};

const forecastBerlin = {
  latitude: 52.52,
  longitude: 13.41,
  timezone: 'Europe/Berlin',
  current: {
    time: '2026-08-25T12:00',
    temperature_2m: 18.4,
    relative_humidity_2m: 55,
    weather_code: 2,
    wind_speed_10m: 12,
  },
  daily: {
    time: ['2026-08-25'],
    weather_code: [2],
    temperature_2m_max: [21],
    temperature_2m_min: [14],
    precipitation_sum: [0],
  },
};

describe('api-bff', () => {
  it('responds with ok status on /api/health', async () => {
    const app = await createApp({ rateLimit: false });
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    await app.close();
  });

  it('maps search through the BFF DTO and sets cache headers', async () => {
    const search = vi.fn().mockResolvedValue(geocodeBerlin);
    const app = await createApp({
      rateLimit: false,
      upstream: { search, forecast: vi.fn() },
    });

    const first = await app.inject({ method: 'GET', url: '/api/weather/search?q=Berlin' });
    expect(first.statusCode).toBe(200);
    expect(first.headers['cache-control']).toContain('s-maxage=3600');
    expect(first.json()).toEqual({
      results: [{ id: 2950159, name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.41 }],
    });

    const second = await app.inject({ method: 'GET', url: '/api/weather/search?q=Berlin' });
    expect(second.statusCode).toBe(200);
    expect(search).toHaveBeenCalledTimes(1);
    await app.close();
  });

  it('maps forecast through the BFF DTO and sets 15-minute cache headers', async () => {
    const forecast = vi.fn().mockResolvedValue(forecastBerlin);
    const app = await createApp({
      rateLimit: false,
      upstream: { search: vi.fn(), forecast },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/weather/forecast?lat=52.52&lon=13.41',
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toContain('s-maxage=900');
    expect(res.json().current.temperatureC).toBe(18.4);
    expect(res.json().daily).toHaveLength(1);
    await app.close();
  });

  it('rejects an empty search query', async () => {
    const app = await createApp({
      rateLimit: false,
      upstream: { search: vi.fn(), forecast: vi.fn() },
    });
    const res = await app.inject({ method: 'GET', url: '/api/weather/search?q=' });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('returns 503 when the upstream search fails', async () => {
    const app = await createApp({
      rateLimit: false,
      upstream: {
        search: vi.fn().mockRejectedValue(new UpstreamError()),
        forecast: vi.fn(),
      },
    });
    const res = await app.inject({ method: 'GET', url: '/api/weather/search?q=Berlin' });
    expect(res.statusCode).toBe(503);
    expect(res.json().error.code).toBe('upstream_unavailable');
    await app.close();
  });

  it('does not call live Open-Meteo hosts from the default client in this suite', () => {
    expect(GEOCODING_URL).toContain('open-meteo.com');
    expect(FORECAST_URL).toContain('open-meteo.com');
  });
});
