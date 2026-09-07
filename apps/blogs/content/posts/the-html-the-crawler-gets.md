---
title: The HTML the crawler actually gets
tagline: If it is not in the file, it is not in search.
description: How to check prerendered Angular HTML for real content, social cards, JSON-LD, and a 404 that stays a 404.
date: '2026-03-06'
mainTag: angular
tags: [frontend, seo, ssr-ssg]
draft: false
---

## **What** was the situation

The portfolio has a Lighthouse SEO report on purpose. How is the same kind of site: public pages, SSG, no CMS. I still opened `dist/` once and found a note page whose body was an empty app root. The title was fine. The article was not there. A crawler would have ranked a shell.

That is a different bug from "forgot the resolver". The resolver can write tags while the route still prerenders a spinner because the markdown was not in the build yet, or `getPrerenderParams` returned nothing, or the fallback tried to render on a host that cannot.

You have to look at the HTML the crawler gets. Not the Chrome tab after hydration.

## **When** does this apply

Use this when you ship a public Angular site and you care about search or share cards.

- After adding a note, a route, or a new `mainTag`.
- When Slack or iMessage shows the home card on a deep link.
- When Lighthouse SEO is green but Google is still storing a generic title.

Skip this on authenticated product UI. There is no crawler you owe a body to.

## **How** is it done

Build, then open the file. Do not negotiate with the running dev server. Dev still has JavaScript. The crawler often does not wait.

```bash
npm run build
```

For How, a note should exist as static HTML under the slug. Open that file and search for three things:

1. The `<h1>` and a paragraph from the note, not just `<app-root>`
2. `rel="canonical"` and `og:url` with `https://how.athreya.codes/...`
3. JSON-LD that names the article, not a leftover `WebSite` graph from home

If the body is missing, the prerender list is wrong. `getPrerenderParams` has to run against the same markdown the client will read. Generate that list in `prebuild`, not in a later job.

```ts
async getPrerenderParams() {
  return inject(Posts).all.map((post) => ({ slug: post.slug }));
}
```

Unknown slugs should 404. `PrerenderFallback.None` plus a 404 route that is itself prerendered. A fallback that "tries later" on Firebase Hosting becomes a blank page with a 200. Search engines love a 200.

Social cards: paste the URL into a debugger when you can, but the file is the source of truth. If `og:title` in the file is the home title, the resolver did not run for that path.

## Watch out for

Do not trust a green Lighthouse run on `localhost:4201`. That session had JavaScript. Run Lighthouse on the built files or on production.

Do not leave `index, follow` on the 404 page. That page will rank for typos.

And if you add a note and forget to run the content script, prerender will bake last week’s slug list. The new URL 404s until the next full build. That is why `prebuild` runs `content.mjs` before `ng build`.
