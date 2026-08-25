import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url';
import { WeatherApi } from './weather-api';

describe('WeatherApi', () => {
  let api: WeatherApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
      ],
    });
    api = TestBed.inject(WeatherApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('calls the BFF search endpoint', () => {
    let result: unknown;
    api.search('Berlin').subscribe((value) => {
      result = value;
    });

    const req = http.expectOne('http://localhost:3000/api/weather/search?q=Berlin');
    expect(req.request.method).toBe('GET');
    req.flush({
      results: [{ id: 1, name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.4 }],
    });

    expect(result).toEqual({
      results: [{ id: 1, name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.4 }],
    });
  });
});
