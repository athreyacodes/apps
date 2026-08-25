import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { WeatherForecastResponse, WeatherSearchResult } from '@apps/contract-bff';
import { WeatherApi } from '@apps/data-access-weather';
import { Empty, ErrorState } from '@apps/ui';
import { LastCityStore } from './last-city.store';
import { formatTempC, formatWindKmh, weatherLabel } from './weather-code';

@Component({
  selector: 'app-weather-page',
  imports: [Empty, ErrorState],
  templateUrl: './weather-page.html',
  styleUrl: './weather-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherPage {
  private readonly api = inject(WeatherApi);
  private readonly lastCity = inject(LastCityStore);

  protected readonly query = signal('');
  protected readonly results = signal<WeatherSearchResult[]>([]);
  protected readonly selected = signal<WeatherSearchResult | null>(this.lastCity.read());
  protected readonly forecast = signal<WeatherForecastResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly weatherLabel = weatherLabel;
  protected readonly formatTempC = formatTempC;
  protected readonly formatWindKmh = formatWindKmh;

  constructor() {
    const city = this.selected();
    if (city) {
      void this.loadForecast(city);
    }
  }

  protected onQueryInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  protected async onSearch(event: Event): Promise<void> {
    event.preventDefault();
    const q = this.query().trim();
    if (!q) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.api.search(q));
      this.results.set(response.results);
      if (response.results.length === 0) {
        this.forecast.set(null);
      }
    } catch {
      this.error.set('Could not search cities. Try again.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async selectCity(city: WeatherSearchResult): Promise<void> {
    this.selected.set(city);
    this.lastCity.write(city);
    this.results.set([]);
    await this.loadForecast(city);
  }

  protected retry(): void {
    const city = this.selected();
    if (city) {
      void this.loadForecast(city);
      return;
    }
    if (this.query().trim()) {
      void this.onSearch(new Event('submit'));
    }
  }

  private async loadForecast(city: WeatherSearchResult): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.api.forecast(city.lat, city.lon));
      this.forecast.set(response);
    } catch {
      this.forecast.set(null);
      this.error.set('Could not load the forecast. Try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
