import { z } from 'zod';

export const WeatherSearchResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export const WeatherSearchResponseSchema = z.object({
  results: z.array(WeatherSearchResultSchema),
});

export const WeatherCurrentSchema = z.object({
  temperatureC: z.number(),
  weatherCode: z.number(),
  windSpeedKmh: z.number(),
  humidityPct: z.number().optional(),
  observedAt: z.string(),
});

export const WeatherDailySchema = z.object({
  date: z.string(),
  weatherCode: z.number(),
  tempMaxC: z.number(),
  tempMinC: z.number(),
  precipitationMm: z.number(),
});

export const WeatherLocationSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
  lat: z.number(),
  lon: z.number(),
  timezone: z.string().optional(),
});

export const WeatherForecastResponseSchema = z.object({
  location: WeatherLocationSchema,
  current: WeatherCurrentSchema,
  daily: z.array(WeatherDailySchema),
});

export type WeatherSearchResult = z.infer<typeof WeatherSearchResultSchema>;
export type WeatherSearchResponse = z.infer<typeof WeatherSearchResponseSchema>;
export type WeatherCurrent = z.infer<typeof WeatherCurrentSchema>;
export type WeatherDaily = z.infer<typeof WeatherDailySchema>;
export type WeatherLocation = z.infer<typeof WeatherLocationSchema>;
export type WeatherForecastResponse = z.infer<typeof WeatherForecastResponseSchema>;
