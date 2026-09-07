import { Routes } from '@angular/router';

import seoData from './data/seo.json';
import {
  homeSeoResolver,
  notFoundSeoResolver,
  postResolver,
  postTitleResolver,
} from './core/seo.resolver';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: seoData.home.title,
    resolve: { seo: homeSeoResolver },
  },
  {
    path: '404',
    title: seoData.notFound.title,
    resolve: { seo: notFoundSeoResolver },
    loadComponent: () => import('./pages/not-found/not-found').then((module) => module.NotFound),
  },
  {
    path: ':slug',
    title: postTitleResolver,
    resolve: { post: postResolver },
    loadComponent: () => import('./pages/post/post').then((module) => module.PostPage),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
