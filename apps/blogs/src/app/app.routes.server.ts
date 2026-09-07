import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, type ServerRoute } from '@angular/ssr';

import { Posts } from './core/posts';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '404',
    renderMode: RenderMode.Prerender,
  },
  {
    path: ':slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return inject(Posts).all.map((post) => ({ slug: post.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
