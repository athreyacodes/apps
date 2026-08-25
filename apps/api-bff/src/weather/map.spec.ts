import { mapForecast, mapSearch } from './map';

describe('weather mappers', () => {
  it('maps Open-Meteo geocoding into our search DTO', () => {
    expect(
      mapSearch({
        results: [
          {
            id: 2950159,
            name: 'Berlin',
            country: 'Germany',
            latitude: 52.52,
            longitude: 13.41,
          },
        ],
      }),
    ).toEqual({
      results: [{ id: 2950159, name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.41 }],
    });
  });

  it('returns an empty list when geocoding has no results', () => {
    expect(mapSearch({})).toEqual({ results: [] });
  });

  it('maps Open-Meteo forecast into our DTO, not the wire shape', () => {
    const mapped = mapForecast({
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
        time: ['2026-08-25', '2026-08-26'],
        weather_code: [2, 61],
        temperature_2m_max: [21, 17],
        temperature_2m_min: [14, 12],
        precipitation_sum: [0, 3.2],
      },
    });

    expect(mapped.current.temperatureC).toBe(18.4);
    expect(mapped.daily).toHaveLength(2);
    expect(mapped).not.toHaveProperty('current.temperature_2m');
  });
});
