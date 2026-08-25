import {
  WeatherForecastResponseSchema,
  WeatherSearchResponseSchema,
  type WeatherForecastResponse,
  type WeatherSearchResponse,
} from '@apps/contract-bff';

type GeocodingHit = {
  id: number;
  name: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
};

type GeocodingWire = {
  results?: GeocodingHit[];
};

type ForecastWire = {
  latitude: number;
  longitude: number;
  timezone?: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m?: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
};

export function mapSearch(wire: GeocodingWire): WeatherSearchResponse {
  return WeatherSearchResponseSchema.parse({
    results: (wire.results ?? []).map((hit) => ({
      id: hit.id,
      name: hit.name,
      country: hit.country ?? hit.country_code ?? '',
      lat: hit.latitude,
      lon: hit.longitude,
    })),
  });
}

export function mapForecast(wire: ForecastWire): WeatherForecastResponse {
  return WeatherForecastResponseSchema.parse({
    location: {
      lat: wire.latitude,
      lon: wire.longitude,
      timezone: wire.timezone,
    },
    current: {
      temperatureC: wire.current.temperature_2m,
      weatherCode: wire.current.weather_code,
      windSpeedKmh: wire.current.wind_speed_10m,
      humidityPct: wire.current.relative_humidity_2m,
      observedAt: wire.current.time,
    },
    daily: wire.daily.time.map((date, index) => ({
      date,
      weatherCode: wire.daily.weather_code[index],
      tempMaxC: wire.daily.temperature_2m_max[index],
      tempMinC: wire.daily.temperature_2m_min[index],
      precipitationMm: wire.daily.precipitation_sum[index],
    })),
  });
}
