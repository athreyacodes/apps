import { Route } from '@angular/router';
import { seoData } from '@apps/seo';
import { Home } from './home/home';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', component: Home, title: seoData.pages.home.title },
];
