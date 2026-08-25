import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { WeatherForecastResponse, WeatherSearchResponse } from '@apps/contract-bff';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';

@Injectable({ providedIn: 'root' })
export class WeatherApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  search(q: string): Observable<WeatherSearchResponse> {
    const params = new HttpParams().set('q', q);
    return this.http.get<WeatherSearchResponse>(`${this.base}/api/weather/search`, { params });
  }

  forecast(lat: number, lon: number): Observable<WeatherForecastResponse> {
    const params = new HttpParams().set('lat', String(lat)).set('lon', String(lon));
    return this.http.get<WeatherForecastResponse>(`${this.base}/api/weather/forecast`, { params });
  }
}
