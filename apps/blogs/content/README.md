# Adding a note

1. Create `content/posts/your-slug.md` (lowercase kebab-case).
2. Run `npm start` or `npm run build`.

## Frontmatter

```yaml
title: Short, specific title
tagline: One spoken line for the card.
description: One sentence for search and social cards.
date: '2026-08-24'
updated: '2026-08-24' # optional; defaults to date
mainTag: angular # angular | javascript | frontend | micro-front-end | seo | ssr-ssg | node | go | backend | mcp | ai
tags: [frontend] # optional extras from the same list
draft: false
```

- **slug** is the filename. URLs are `https://how.athreya.codes/your-slug`.
- **mainTag** is required. It is the post's primary tag and must be one of the tags above. Social cards use `/images/og-card.jpg` unless the note has a JPEG/PNG/WebP `image`.
- **tags** are extra labels from that same list. Typical pairs: `angular` + `frontend`, `javascript` + `frontend`, `node` + `backend`, `go` + `backend`, `mcp` + `ai`. Add `micro-front-end`, `seo`, or `ssr-ssg` when that is the subject. `mainTag` is always included in the generated tag list.
- Write the body like you are talking to a teammate. Use **What** was the situation, then **When** does this apply, then **How** is it done. Add **Watch out for** only if there is a real failure mode. Be generous with explanation. The full writing rules are in `.cursor/skills/write-how-note/SKILL.md`.
- **draft: true** is skipped in production builds. `npm start` includes drafts.
- Reserved slugs: `404`, `about`, `search`, `tags`.
- `npm run build` regenerates `public/sitemap.xml`, `public/rss.xml`, and `public/llms.txt` from published notes.

Fenced code gets a language label, line numbers, and a copy button automatically.
