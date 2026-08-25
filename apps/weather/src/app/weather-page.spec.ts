import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WeatherApi } from '@apps/data-access-weather';
import { WeatherPage } from './weather-page';
import { LAST_CITY_STORAGE_KEY } from './last-city.store';

const forecast = {
  location: { lat: 52.52, lon: 13.4, timezone: 'Europe/Berlin' },
  current: {
    temperatureC: 18.4,
    weatherCode: 2,
    windSpeedKmh: 12,
    humidityPct: 55,
    observedAt: '2026-08-25T12:00',
  },
  daily: [
    {
      date: '2026-08-25',
      weatherCode: 2,
      tempMaxC: 21,
      tempMinC: 14,
      precipitationMm: 0,
    },
  ],
};

describe('WeatherPage', () => {
  beforeEach(() => {
    localStorage.removeItem(LAST_CITY_STORAGE_KEY);
  });

  it('prompts to search when there is no last city', async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherPage],
      providers: [
        provideRouter([]),
        {
          provide: WeatherApi,
          useValue: { search: () => of({ results: [] }), forecast: () => of(forecast) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WeatherPage);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Search a city');
  });

  it('shows a retry control when forecast loading fails', async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherPage],
      providers: [
        provideRouter([]),
        {
          provide: WeatherApi,
          useValue: {
            search: () => throwError(() => new Error('nope')),
            forecast: () => throwError(() => new Error('nope')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WeatherPage);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Berlin';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Could not search cities');
    expect(fixture.nativeElement.querySelector('ui-error button')?.textContent).toContain('Retry');
  });

  it('renders Open-Meteo attribution', async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherPage],
      providers: [
        provideRouter([]),
        {
          provide: WeatherApi,
          useValue: { search: () => of({ results: [] }), forecast: () => of(forecast) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WeatherPage);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Open-Meteo');
  });
});
