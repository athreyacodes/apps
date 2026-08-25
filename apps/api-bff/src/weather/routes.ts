import type { FastifyInstance } from 'fastify';
import type { WeatherForecastResponse, WeatherSearchResponse } from '@apps/contract-bff';
import { TtlCache } from '../cache';
import {
  FORECAST_CACHE_CONTROL,
  FORECAST_TTL_MS,
  SEARCH_CACHE_CONTROL,
  SEARCH_TTL_MS,
} from './constants';
import { mapForecast, mapSearch } from './map';
import { UpstreamError, type UpstreamClient } from './open-meteo';

const Q_MAX = 100;

function sendError(
  reply: { status: (code: number) => { send: (payload: unknown) => unknown } },
  status: number,
  code: string,
  message: string,
) {
  return reply.status(status).send({ error: { code, message } });
}

export function registerWeatherRoutes(
  app: FastifyInstance,
  deps: { upstream: UpstreamClient; now?: () => number },
): void {
  const searchCache = new TtlCache<WeatherSearchResponse>(deps.now);
  const forecastCache = new TtlCache<WeatherForecastResponse>(deps.now);

  app.get('/api/weather/search', async (request, reply) => {
    const q =
      typeof request.query === 'object' && request.query && 'q' in request.query
        ? String((request.query as { q?: unknown }).q ?? '').trim()
        : '';

    if (!q || q.length > Q_MAX) {
      return sendError(reply, 400, 'bad_request', 'Query q is required (1–100 characters).');
    }

    const cacheKey = q.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return reply.header('cache-control', SEARCH_CACHE_CONTROL).send(cached);
    }

    try {
      const mapped = mapSearch((await deps.upstream.search(q)) as Parameters<typeof mapSearch>[0]);
      searchCache.set(cacheKey, mapped, SEARCH_TTL_MS);
      return reply.header('cache-control', SEARCH_CACHE_CONTROL).send(mapped);
    } catch (err) {
      request.log.warn({ err }, 'weather search failed');
      if (err instanceof UpstreamError) {
        return sendError(reply, 503, 'upstream_unavailable', 'Weather search is unavailable.');
      }
      return sendError(reply, 502, 'bad_gateway', 'Weather search returned an unexpected payload.');
    }
  });

  app.get('/api/weather/forecast', async (request, reply) => {
    const raw =
      typeof request.query === 'object' && request.query
        ? (request.query as { lat?: unknown; lon?: unknown })
        : {};
    const lat = Number(raw.lat);
    const lon = Number(raw.lon);

    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -180 ||
      lon > 180
    ) {
      return sendError(reply, 400, 'bad_request', 'lat and lon are required as valid coordinates.');
    }

    const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    const cached = forecastCache.get(cacheKey);
    if (cached) {
      return reply.header('cache-control', FORECAST_CACHE_CONTROL).send(cached);
    }

    try {
      const mapped = mapForecast(
        (await deps.upstream.forecast(lat, lon)) as Parameters<typeof mapForecast>[0],
      );
      forecastCache.set(cacheKey, mapped, FORECAST_TTL_MS);
      return reply.header('cache-control', FORECAST_CACHE_CONTROL).send(mapped);
    } catch (err) {
      request.log.warn({ err }, 'weather forecast failed');
      if (err instanceof UpstreamError) {
        return sendError(reply, 503, 'upstream_unavailable', 'Weather forecast is unavailable.');
      }
      return sendError(
        reply,
        502,
        'bad_gateway',
        'Weather forecast returned an unexpected payload.',
      );
    }
  });
}
