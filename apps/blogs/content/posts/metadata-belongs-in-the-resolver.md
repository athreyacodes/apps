---
title: Metadata belongs in the resolver, not ngOnInit
tagline: The crawler never waits for your component to wake up.
description: How to set title, canonical, and Open Graph tags in a route resolver so prerendered HTML already has them.
date: '2026-02-27'
mainTag: angular
tags: [frontend, seo, ssr-ssg]
draft: false
---

## **What** was the situation

On How, every note has a title, a description, a canonical URL, and social tags. On the portfolio it is the same job: the home page is one person, the URL is absolute, Slack should not show a leftover title from the previous route.

I used to set all of that in `ngOnInit`. It looks right in the browser after JavaScript runs. The file on disk still has yesterday’s title, or none. Crawlers and iMessage take the file.

A resolver runs while the route is resolving. Prerender runs the resolver. The static HTML already has the tags. That is the whole SEO trick on both sites.

## **When** does this apply

Use this on any public Angular route whose metadata depends on the URL.

- A `/:slug` note, a case study, a product marketing page.
- A site on Firebase Hosting or any static host, where there is no server to fix tags later.
- A portfolio where canonical and `og:url` must be absolute, not `/about`.

Skip this on a logged-in tool. An email-security platform’s product UI does not need Google to index a detection. Do not prerender that, and do not pretend a resolver is for SEO there.

## **How** is it done

Put one function on the route. Read the param, look up the record, write the tags, return something truthy so the route can activate.

```ts
export const postSeoResolver: ResolveFn<boolean> = (route) => {
  const post = inject(Posts).bySlug(route.paramMap.get('slug') ?? '');

  if (post) {
    inject(SeoService).applyPost(post);
  }

  return true;
};
```

`applyPost` is allowed to be boring. Title, description, canonical, Open Graph, Twitter, JSON-LD. Absolute URLs. The same origin you put in `seo.json`, not `window.location` — there is no window at prerender.

```ts
applyPost(post: Post): void {
  const title = `${post.title} · How`;
  this.applyTags({
    title,
    description: post.description,
    path: `/${post.slug}`,
    ogType: 'article',
    ogImage: post.banner
  });
}
```

Wire it on the slug route so it runs for every note, including the ones you add next month:

```ts
{
  path: ':slug',
  loadComponent: () => import('./pages/post/post').then((m) => m.PostPage),
  resolve: { seo: postSeoResolver }
}
```

The component can still `inject(Posts)` for the body. It should not set the title again. One writer.

## Watch out for

Do not set tags in both the resolver and `ngOnInit` "to be safe". You will get a flash of the resolver title, then a different `ngOnInit` title in the browser, and you will not know which file the crawler kept.

Do not build `og:url` from a relative path without the site origin. Social crawlers will store `https:///:slug` and you will chase it for a day.

If the slug is missing, send people to a real 404 route that has its own `noindex` metadata. A resolver that silently applies home tags on a missing post is how a dead URL looks live in search.
