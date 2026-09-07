import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';

import seoData from '../data/seo.json';
import type { Post } from './post';
import { Posts } from './posts';
import { SeoService } from './seo';

export const postTitleResolver: ResolveFn<string> = (route) => {
  const post = inject(Posts).bySlug(route.paramMap.get('slug') ?? '');
  return post ? `${post.title} · How` : seoData.notFound.title;
};

export const homeSeoResolver: ResolveFn<boolean> = () => {
  const posts = inject(Posts);
  inject(SeoService).applyHome(posts.newestUpdated());
  return true;
};

export const postResolver: ResolveFn<Post> = (route) => {
  const post = inject(Posts).bySlug(route.paramMap.get('slug') ?? '');

  if (!post) {
    return new RedirectCommand(inject(Router).parseUrl('/404'));
  }

  inject(SeoService).applyPost(post);
  return post;
};

export const notFoundSeoResolver: ResolveFn<boolean> = () => {
  inject(SeoService).applyNotFound();
  return true;
};
