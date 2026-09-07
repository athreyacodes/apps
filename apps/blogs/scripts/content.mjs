import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';
import hljs from 'highlight.js';
import { marked } from 'marked';

import seoData from '../src/app/data/seo.json' with { type: 'json' };

const TAGS = [
  'angular',
  'javascript',
  'frontend',
  'micro-front-end',
  'seo',
  'ssr-ssg',
  'node',
  'go',
  'backend',
  'mcp',
  'ai',
];
const RESERVED_SLUGS = new Set(['404', 'about', 'search', 'tags']);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = join(root, 'content/posts');
const generatedDir = join(root, 'src/app/generated');
const includeDrafts = process.argv.includes('--drafts');
const siteUrl = seoData.siteUrl.replace(/\/$/, '');

const LANG_ALIASES = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
};

function fail(message) {
  console.error(`content: ${message}`);
  process.exit(1);
}

function toDate(value, slug, field) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string' && DATE.test(value)) {
    return value;
  }

  fail(`${slug}: ${field} must be YYYY-MM-DD`);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function highlight(code, lang) {
  const resolved = LANG_ALIASES[lang] ?? lang;

  if (resolved && hljs.getLanguage(resolved)) {
    return hljs.highlight(code, { language: resolved }).value;
  }

  return escapeHtml(code);
}

function wrapLines(html) {
  const lines = html.split('\n');
  return lines
    .map((line) => `<span class="code-block__line">${line.length ? line : '\n'}</span>`)
    .join('');
}

function renderFence(code, lang) {
  const label = lang || 'text';
  const highlighted = wrapLines(highlight(code.replace(/\n$/, ''), lang));

  return [
    '<div class="code-block">',
    '<div class="code-block__bar">',
    `<span class="code-block__lang">${escapeHtml(label)}</span>`,
    '<button type="button" class="code-block__copy" data-copy aria-label="Copy code">Copy</button>',
    '</div>',
    `<pre><code class="hljs${lang ? ` language-${escapeHtml(lang)}` : ''}">${highlighted}</code></pre>`,
    `<textarea class="code-block__source" hidden readonly>${escapeHtml(code)}</textarea>`,
    '</div>',
  ].join('');
}

function headingId(text) {
  const plain = String(text)
    .replace(/\*+/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase();

  if (plain.startsWith('what')) {
    return 'what';
  }

  if (plain.startsWith('when')) {
    return 'when';
  }

  if (plain.startsWith('how')) {
    return 'how';
  }

  if (plain.startsWith('watch')) {
    return 'watch-out-for';
  }

  return plain.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

marked.use({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      return renderFence(text, lang);
    },
    heading({ text, tokens, depth }) {
      const html = this.parser.parseInline(tokens);
      const id = depth === 2 ? headingId(text) : '';

      if (id) {
        return `<h${depth} id="${escapeHtml(id)}">${html}</h${depth}>\n`;
      }

      return `<h${depth}>${html}</h${depth}>\n`;
    },
  },
});

function wrapPostSections(html) {
  return html
    .split(/(?=<h2\b)/i)
    .map((chunk) => {
      const match = chunk.match(/^<h2\s+id="([^"]+)"/i);

      if (!match) {
        return chunk;
      }

      const id = match[1];
      const inner = chunk.replace(/^<h2\s+id="[^"]+"/, '<h2');
      return `<section id="${escapeHtml(id)}" class="post-section">${inner}</section>`;
    })
    .join('');
}

const RASTER_IMAGE = /\.(?:jpe?g|png|webp)$/i;

function defaultBanner(tag) {
  const webp = join(root, 'public/images/tags', `${tag}.webp`);
  const svg = join(root, 'public/images/tags', `${tag}.svg`);

  if (existsSync(webp)) {
    return `/images/tags/${tag}.webp`;
  }

  if (existsSync(svg)) {
    return `/images/tags/${tag}.svg`;
  }

  return seoData.home.ogImage;
}

function seoImageOf(image) {
  if (typeof image === 'string' && RASTER_IMAGE.test(image)) {
    return image;
  }

  return seoData.home.ogImage;
}

function wordCount(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text ? text.split(' ').length : 0;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function latestUpdated(posts) {
  return posts.reduce(
    (latest, post) => (post.updated > latest ? post.updated : latest),
    seoData.dateModified,
  );
}

function rfc822(isoDate) {
  return new Date(`${isoDate}T12:00:00.000Z`).toUTCString();
}

function normalizeTags(tags, slug, mainTag) {
  if (tags == null) {
    return [mainTag];
  }

  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    fail(`${slug}: tags must be an array of strings`);
  }

  const extras = [];

  for (const raw of tags) {
    const tag = raw.trim();

    if (!TAGS.includes(tag)) {
      fail(`${slug}: tag "${tag}" must be one of ${TAGS.join(', ')}`);
    }

    if (tag !== mainTag && !extras.includes(tag)) {
      extras.push(tag);
    }
  }

  return [mainTag, ...extras];
}

async function loadPosts() {
  if (!existsSync(postsDir)) {
    fail(`missing ${postsDir}`);
  }

  const names = (await readdir(postsDir)).filter((name) => name.endsWith('.md')).sort();

  if (names.length === 0) {
    fail('no markdown files in content/posts');
  }

  const seen = new Set();
  const posts = [];

  for (const name of names) {
    const slug = name.slice(0, -3);
    const source = await readFile(join(postsDir, name), 'utf8');
    const { data, content } = matter(source);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      fail(`${slug}: slug must be lowercase kebab-case`);
    }

    if (RESERVED_SLUGS.has(slug)) {
      fail(`${slug}: reserved slug`);
    }

    if (seen.has(slug)) {
      fail(`${slug}: duplicate slug`);
    }

    seen.add(slug);

    if (!data.title || typeof data.title !== 'string') {
      fail(`${slug}: title is required`);
    }

    if (!data.description || typeof data.description !== 'string') {
      fail(`${slug}: description is required`);
    }

    const tagline =
      typeof data.tagline === 'string' && data.tagline.trim()
        ? data.tagline.trim()
        : data.description.trim();

    const date = toDate(data.date, slug, 'date');
    const updated = data.updated == null ? date : toDate(data.updated, slug, 'updated');

    if (!TAGS.includes(data.mainTag)) {
      fail(`${slug}: mainTag must be one of ${TAGS.join(', ')}`);
    }

    if (data.image != null && (typeof data.image !== 'string' || !data.image.startsWith('/'))) {
      fail(`${slug}: image must be a root-relative path`);
    }

    const draft = Boolean(data.draft);

    if (draft && !includeDrafts) {
      continue;
    }

    const html = wrapPostSections(marked.parse(content.trim(), { async: false }));
    const banner = data.image || defaultBanner(data.mainTag);

    posts.push({
      slug,
      title: data.title.trim(),
      tagline,
      description: data.description.trim(),
      date,
      updated,
      mainTag: data.mainTag,
      tags: normalizeTags(data.tags, slug, data.mainTag),
      image: data.image ?? null,
      banner,
      seoImage: seoImageOf(data.image),
      wordCount: wordCount(html),
      draft,
      html,
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return posts;
}

function sitemapXml(posts) {
  const shareImage = `${siteUrl}${seoData.home.ogImage}`;
  const urls = [
    {
      loc: `${siteUrl}/`,
      lastmod: latestUpdated(posts),
      changefreq: 'weekly',
      priority: '1.0',
      image: shareImage,
      imageTitle: seoData.home.imageAlt,
    },
    ...posts.map((post) => ({
      loc: `${siteUrl}/${post.slug}`,
      lastmod: post.updated,
      changefreq: 'monthly',
      priority: '0.8',
      image: `${siteUrl}${post.seoImage}`,
      imageTitle: post.title,
    })),
  ];

  const body = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    <image:image>
      <image:loc>${escapeXml(url.image)}</image:loc>
      <image:title>${escapeXml(url.imageTitle)}</image:title>
    </image:image>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
}

function rssXml(posts) {
  const lastBuild = rfc822(latestUpdated(posts));
  const items = posts
    .map((post) => {
      const link = `${siteUrl}/${post.slug}`;
      const categories = post.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <description>${escapeXml(post.description)}</description>
${categories}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(seoData.siteName)}</title>
    <link>${escapeXml(`${siteUrl}/`)}</link>
    <atom:link href="${escapeXml(`${siteUrl}${seoData.rssPath}`)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(seoData.home.description)}</description>
    <language>${seoData.language.toLowerCase()}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <managingEditor>${escapeXml(`athreyacodes@gmail.com (${seoData.author})`)}</managingEditor>
    <webMaster>${escapeXml(`athreyacodes@gmail.com (${seoData.author})`)}</webMaster>
    <image>
      <url>${escapeXml(`${siteUrl}${seoData.home.ogImage}`)}</url>
      <title>${escapeXml(seoData.siteName)}</title>
      <link>${escapeXml(`${siteUrl}/`)}</link>
    </image>
${items}
  </channel>
</rss>
`;
}

function llmsTxt(posts) {
  const notes = posts
    .map((post) => `- [${post.title}](${siteUrl}/${post.slug}): ${post.description}`)
    .join('\n');

  return `# How

> Notes from Athreya M R on how he builds software.

The site is a static blog at ${siteUrl}. Each note is one decision explained the way you would tell a teammate — Angular, architecture, and the tools around them.

## Notes

${notes}

## Optional

- [RSS](${siteUrl}${seoData.rssPath})
- [Sitemap](${siteUrl}/sitemap.xml)
- [Author](${seoData.authorUrl})
`;
}

const posts = await loadPosts();
const listing = posts.map((post) => {
  const meta = { ...post };
  delete meta.html;
  return meta;
});
const bodies = Object.fromEntries(posts.map((post) => [post.slug, post.html]));

await mkdir(generatedDir, { recursive: true });
await writeFile(
  join(generatedDir, 'posts.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), posts: listing }, null, 2)}\n`,
);
await writeFile(join(generatedDir, 'bodies.json'), `${JSON.stringify(bodies)}\n`);
await writeFile(join(root, 'public/sitemap.xml'), sitemapXml(listing));
await writeFile(join(root, 'public/rss.xml'), rssXml(listing));
await writeFile(join(root, 'public/llms.txt'), llmsTxt(listing));

console.log(`content: ${posts.length} post(s)${includeDrafts ? ' (drafts included)' : ''}`);
