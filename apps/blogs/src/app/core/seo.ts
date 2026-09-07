import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import seoData from '../data/seo.json';
import { TAG_LABELS, type Post } from './post';
import { Posts } from './posts';

const SITE_URL = seoData.siteUrl.replace(/\/$/, '');
const INDEX_ROBOTS = seoData.robots;
const RSS_URL = `${SITE_URL}${seoData.rssPath}`;
const ARTICLE_SELECTORS = [
  'property="article:published_time"',
  'property="article:modified_time"',
  'property="article:author"',
  'property="article:section"',
  'property="article:tag"',
];

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  ogType?: string;
  ogImage?: string;
  imageAlt?: string;
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly posts = inject(Posts);

  applyHome(dateModified?: string): void {
    const config = seoData.home;
    const modified = dateModified ?? this.posts.newestUpdated() ?? seoData.dateModified;

    this.applyTags({
      title: config.title,
      description: config.description,
      path: '/',
      ogType: config.ogType,
      ogImage: config.ogImage,
      imageAlt: config.imageAlt,
    });

    this.setStructuredData(this.homeGraph(modified));
  }

  applyPost(post: Post): void {
    const title = `${post.title} · How`;
    const imageAlt = `${post.title} — ${TAG_LABELS[post.mainTag]}`;

    this.applyTags({
      title,
      description: post.description,
      path: `/${post.slug}`,
      ogType: 'article',
      ogImage: post.seoImage,
      imageAlt,
    });

    this.meta.updateTag({ property: 'article:published_time', content: post.date });
    this.meta.updateTag({ property: 'article:modified_time', content: post.updated });
    this.meta.updateTag({ property: 'article:author', content: seoData.authorUrl });
    this.meta.updateTag({ property: 'article:section', content: TAG_LABELS[post.mainTag] });

    for (const tag of post.tags) {
      this.meta.addTag({ property: 'article:tag', content: TAG_LABELS[tag] });
    }

    this.setStructuredData(this.postGraph(post, title, imageAlt));
  }

  applyNotFound(): void {
    const config = seoData.notFound;

    this.applyTags({
      title: config.title,
      description: config.description,
      path: '/404',
      robots: config.robots,
      ogType: config.ogType,
      ogImage: config.ogImage,
      imageAlt: config.imageAlt,
    });

    this.setStructuredData(null);
  }

  private applyTags(page: PageSeo): void {
    const pageUrl = this.absolute(page.path);
    const image = this.absolute(page.ogImage ?? seoData.home.ogImage);
    const imageAlt = page.imageAlt ?? seoData.home.imageAlt;
    const robots = page.robots ?? INDEX_ROBOTS;

    this.document.documentElement.lang = seoData.language;
    this.clearArticleMeta();
    this.title.setTitle(page.title);

    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ name: 'googlebot', content: robots });
    this.meta.updateTag({ name: 'author', content: seoData.author });
    this.meta.updateTag({ name: 'application-name', content: seoData.siteName });
    this.meta.updateTag({ name: 'apple-mobile-web-app-title', content: seoData.siteName });
    this.meta.updateTag({ name: 'theme-color', content: '#eeeeee' });

    this.meta.updateTag({ property: 'og:site_name', content: seoData.siteName });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:type', content: seoData.ogImageType });
    this.meta.updateTag({ property: 'og:image:width', content: String(seoData.ogImageWidth) });
    this.meta.updateTag({ property: 'og:image:height', content: String(seoData.ogImageHeight) });
    this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.meta.updateTag({ property: 'og:type', content: page.ogType ?? 'website' });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:locale', content: seoData.locale });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });

    this.setCanonical(pageUrl);
    this.setLink('author', seoData.authorUrl);
    this.setLink('alternate', RSS_URL, {
      type: 'application/rss+xml',
      title: `${seoData.siteName} notes`,
    });
    this.setLink('sitemap', `${SITE_URL}/sitemap.xml`, { type: 'application/xml' });
  }

  private homeGraph(dateModified: string): Record<string, unknown> {
    const websiteId = `${SITE_URL}/#website`;
    const personId = `${SITE_URL}/#person`;
    const blogId = `${SITE_URL}/#blog`;
    const pageId = `${SITE_URL}/#webpage`;
    const listId = `${SITE_URL}/#feed`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        this.personNode(personId),
        {
          '@type': 'WebSite',
          '@id': websiteId,
          name: seoData.siteName,
          alternateName: 'Here’s how!',
          description: seoData.home.ogDescription,
          url: `${SITE_URL}/`,
          inLanguage: seoData.language,
          publisher: { '@id': personId },
          author: { '@id': personId },
          image: this.absolute(seoData.home.ogImage),
        },
        {
          '@type': 'Blog',
          '@id': blogId,
          name: seoData.siteName,
          description: seoData.home.description,
          url: `${SITE_URL}/`,
          isPartOf: { '@id': websiteId },
          inLanguage: seoData.language,
          dateModified,
          author: { '@id': personId },
          publisher: { '@id': personId },
          blogPost: this.posts.all.map((post) => ({
            '@type': 'BlogPosting',
            '@id': `${this.absolute(`/${post.slug}`)}#post`,
            headline: post.title,
            url: this.absolute(`/${post.slug}`),
            datePublished: post.date,
            dateModified: post.updated,
          })),
        },
        {
          '@type': 'CollectionPage',
          '@id': pageId,
          url: `${SITE_URL}/`,
          name: seoData.home.title,
          description: seoData.home.description,
          inLanguage: seoData.language,
          isPartOf: { '@id': websiteId },
          about: { '@id': blogId },
          mainEntity: { '@id': listId },
          dateModified,
        },
        {
          '@type': 'ItemList',
          '@id': listId,
          numberOfItems: this.posts.all.length,
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          itemListElement: this.posts.all.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: this.absolute(`/${post.slug}`),
            name: post.title,
          })),
        },
      ],
    };
  }

  private postGraph(post: Post, title: string, imageAlt: string): Record<string, unknown> {
    const websiteId = `${SITE_URL}/#website`;
    const personId = `${SITE_URL}/#person`;
    const pageUrl = this.absolute(`/${post.slug}`);
    const image = this.absolute(post.seoImage);
    const keywords = post.tags.map((tag) => TAG_LABELS[tag]);

    return {
      '@context': 'https://schema.org',
      '@graph': [
        this.personNode(personId),
        {
          '@type': 'WebSite',
          '@id': websiteId,
          name: seoData.siteName,
          url: `${SITE_URL}/`,
          publisher: { '@id': personId },
        },
        {
          '@type': 'ImageObject',
          '@id': `${pageUrl}#image`,
          url: image,
          width: seoData.ogImageWidth,
          height: seoData.ogImageHeight,
          caption: imageAlt,
        },
        {
          '@type': 'WebPage',
          '@id': `${pageUrl}#webpage`,
          url: pageUrl,
          name: title,
          description: post.description,
          inLanguage: seoData.language,
          isPartOf: { '@id': websiteId },
          primaryImageOfPage: { '@id': `${pageUrl}#image` },
          breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
          datePublished: post.date,
          dateModified: post.updated,
        },
        {
          '@type': 'BlogPosting',
          '@id': `${pageUrl}#post`,
          headline: post.title,
          name: title,
          description: post.description,
          url: pageUrl,
          image: { '@id': `${pageUrl}#image` },
          datePublished: post.date,
          dateModified: post.updated,
          inLanguage: seoData.language,
          author: { '@id': personId },
          publisher: { '@id': personId },
          isPartOf: { '@id': `${SITE_URL}/#blog` },
          mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
          keywords,
          articleSection: TAG_LABELS[post.mainTag],
          wordCount: post.wordCount,
          timeRequired: this.readingTime(post.wordCount),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: seoData.siteName,
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: post.title,
              item: pageUrl,
            },
          ],
        },
      ],
    };
  }

  private personNode(personId: string): Record<string, unknown> {
    return {
      '@type': 'Person',
      '@id': personId,
      name: seoData.author,
      url: seoData.authorUrl,
      jobTitle: seoData.authorJobTitle,
      image: this.absolute(seoData.authorImage),
      sameAs: seoData.sameAs,
    };
  }

  private readingTime(wordCount: number): string {
    const minutes = Math.max(1, Math.round(wordCount / 200));
    return `PT${minutes}M`;
  }

  private clearArticleMeta(): void {
    for (const selector of ARTICLE_SELECTORS) {
      while (this.meta.getTag(selector)) {
        this.meta.removeTag(selector);
      }
    }
  }

  private setStructuredData(schema: Record<string, unknown> | null): void {
    const selector = 'script[type="application/ld+json"][data-seo="graph"]';
    const existing = this.document.head.querySelector<HTMLScriptElement>(selector);

    if (!schema) {
      existing?.remove();
      return;
    }

    const payload = JSON.stringify(schema);

    if (existing) {
      existing.textContent = payload;
      return;
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'graph');
    script.textContent = payload;
    this.document.head.appendChild(script);
  }

  private setCanonical(url: string): void {
    this.setLink('canonical', url);
  }

  private setLink(rel: string, href: string, attrs: Record<string, string> = {}): void {
    const extra = Object.entries(attrs)
      .map(([key, value]) => `[${key}="${value.replaceAll('"', '\\"')}"]`)
      .join('');
    const selector = `link[rel="${rel}"]${extra}`;
    let link = this.document.head.querySelector<HTMLLinkElement>(selector);

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);

      for (const [key, value] of Object.entries(attrs)) {
        link.setAttribute(key, value);
      }

      this.document.head.appendChild(link);
    }

    link.setAttribute('href', href);
  }

  private absolute(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${SITE_URL}/${path.replace(/^\//, '')}`;
  }
}
