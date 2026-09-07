---
title: Blogs lives on Apps
tagline: One hub, a prerendered writing route, no extra hostname.
description: Why this writing lives at apps.athreya.codes/blogs as its own Angular app, with the same static SEO How already uses — without moving How.
date: '2026-09-08'
mainTag: seo
tags: [ssr-ssg, frontend]
draft: false
---

## What

This is the writing surface on [Apps](https://apps.athreya.codes/). It is its own Angular app, mounted at `/blogs`, and every public URL is prerendered HTML. Crawlers get titles, canonicals, JSON-LD, and the article body in the first response — not an empty SPA shell.

How stays at [how.athreya.codes](https://how.athreya.codes). These posts are not those notes.

## When

Use this route when the piece belongs with the rest of the toolbox: the Nx graph, the other apps, the same domain. Reach for How when the note is a How note.

## How

Markdown in `content/posts` is compiled at build time. The listing, each slug, and `/blogs/404` are prerendered. Firebase serves those files first. Missing slugs rewrite to the blogs 404 page, not the Apps shell.

```ts
// Production URLs are prefixed by the app base.
// /blogs          → listing
// /blogs/{slug}   → post
// /blogs/404      → not found
```

## Watch out for

Do not catch `/blogs/**` with an SPA rewrite to `index.html`. That would replace prerendered posts with a client shell and undo the SEO this app exists to keep.
