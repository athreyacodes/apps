import { Route } from '@angular/router';
import { seoData } from '@apps/seo';
import { Home } from './home/home';
import { WeatherLanding } from './weather-landing/weather-landing';
import { MarketsLanding } from './markets-landing/markets-landing';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', component: Home, title: seoData.pages.home.title },
  { path: 'weather', component: WeatherLanding, title: seoData.pages.weather.title },
  { path: 'markets', component: MarketsLanding, title: seoData.pages.markets.title },
];
