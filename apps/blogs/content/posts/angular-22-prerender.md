---
title: Angular 22 prerender without the ceremony
tagline: So search engines see the page, not a shell.
description: How to ship crawlable Angular pages with outputMode static, a resolver for metadata, and no CMS.
date: '2026-02-20'
mainTag: angular
tags: [frontend, seo, ssr-ssg]
image: /images/posts/angular-22-prerender/banner.svg
draft: false
---

## **What** was the situation

I kept writing Angular pages the way I write apps: the route loads, JavaScript runs, then the content shows up. That is fine for a logged-in tool on an email-security platform. It is a bad deal for a public note.

Search engines and social crawlers are impatient. A lot of them will take the first HTML they get. If that HTML is an empty shell, they think the page is empty. You can fight that with extra crawler setup. Or you can just give them the page.

Angular 22 can prerender at build time. The route still looks like a normal standalone component. You do not need a CMS. You do not need a server sitting around to render each visit.

This site is that setup. Markdown in. Static HTML out. The portfolio is the same idea.

## **When** does this apply

Use this when the page is public, the content is known at build time, and you care that Google, Slack, and iMessage see a real title and a real body.

- A blog, a docs site, a marketing page, a portfolio.
- A route like `/:slug` where the slug list is finite. You can list every page when you build.
- You are on a static host. Firebase Hosting, GitHub Pages, Nginx with files on disk. There is no Node process waiting to render.

Skip this when the page is different for every user, or the data shows up only after they log in. Prerender cannot invent that HTML at build time. Also skip it if you truly need per-request SSR. That is a different mode, and you have to keep a server.

If you are not sure: if you could write the page in a markdown file, you can prerender it.

## **How** is it done

Keep metadata in a resolver. The tags have to exist in the static file, not only after JavaScript runs. A resolver runs while the route is resolving, so the prerendered HTML already has the title, description, and social tags.

```ts
export const postSeoResolver: ResolveFn<boolean> = (route) => {
  const post = inject(Posts).bySlug(route.paramMap.get('slug') ?? '');

  if (post) {
    inject(SeoService).applyPost(post);
  }

  return true;
};
```

That is the whole trick for SEO. `applyPost` writes the title, canonical, Open Graph, and JSON-LD. Because this runs in the resolver, it is in the file the crawler gets.

The build still needs to know which slugs exist. I read markdown at build time, write a JSON list, then ask the prerenderer to bake each `/:slug` path.

![Markdown becomes prerendered HTML at build time](/images/posts/angular-22-prerender/prerender-flow.svg)

Parameterized SSG needs `getPrerenderParams`. That function returns the slug list the builder should bake:

```ts
{
  path: ':slug',
  renderMode: RenderMode.Prerender,
  fallback: PrerenderFallback.None,
  async getPrerenderParams() {
    return inject(Posts).all.map((post) => ({ slug: post.slug }));
  }
}
```

`PrerenderFallback.None` is the right call for a static host. If someone hits a slug you did not bake, you want a 404. You do not want Angular to try rendering on a server you do not have.

Adding a note is a file in `content/posts`. The next build picks it up, prerenders the path, and you ship HTML. No dashboard.

## Watch out for

If you set metadata in `ngOnInit`, the static file will still look like the previous page, or like nothing. Crawlers do not wait around for that.

If you leave the fallback on, unknown slugs may try to render later. On a static host that just fails in a confusing way. Prefer a real 404.

And if the slug list is empty at prerender time, you will ship a site with no note pages. Generate that list in the same build, before the prerender step, not in a later job.
