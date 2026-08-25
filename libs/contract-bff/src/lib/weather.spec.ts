import { WeatherForecastResponseSchema, WeatherSearchResponseSchema } from './weather';

describe('weather contracts', () => {
  it('parses a search payload', () => {
    const parsed = WeatherSearchResponseSchema.parse({
      results: [{ id: 1, name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.4 }],
    });
    expect(parsed.results).toHaveLength(1);
  });

  it('rejects upstream-shaped forecast payloads', () => {
    expect(() =>
      WeatherForecastResponseSchema.parse({
        latitude: 52.52,
        longitude: 13.4,
        current: { temperature_2m: 12 },
      }),
    ).toThrow();
  });

  it('parses our forecast DTO', () => {
    const parsed = WeatherForecastResponseSchema.parse({
      location: { lat: 52.52, lon: 13.4, timezone: 'Europe/Berlin' },
      current: {
        temperatureC: 12.3,
        weatherCode: 2,
        windSpeedKmh: 10,
        humidityPct: 70,
        observedAt: '2026-08-25T12:00',
      },
      daily: [
        {
          date: '2026-08-25',
          weatherCode: 2,
          tempMaxC: 18,
          tempMinC: 11,
          precipitationMm: 0,
        },
      ],
    });
    expect(parsed.daily[0].date).toBe('2026-08-25');
  });
});
