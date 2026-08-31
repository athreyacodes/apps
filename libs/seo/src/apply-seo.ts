import { DOCUMENT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import seoData from './seo.json';

export type SeoPage = keyof typeof seoData.pages;

const SITE_URL = seoData.siteUrl.replace(/\/$/, '');

export function applyPageSeo(page: SeoPage): void {
  const config = seoData.pages[page];
  const title = inject(Title);
  const meta = inject(Meta);
  const document = inject(DOCUMENT);
  const pageUrl = absolute(config.path);

  document.documentElement.lang = seoData.language;
  title.setTitle(config.title);

  meta.updateTag({ name: 'description', content: config.description });
  meta.updateTag({ name: 'robots', content: seoData.robots });
  meta.updateTag({ name: 'googlebot', content: seoData.robots });
  meta.updateTag({ name: 'author', content: seoData.author });
  meta.updateTag({ name: 'application-name', content: seoData.siteName });
  meta.updateTag({ name: 'apple-mobile-web-app-title', content: seoData.siteName });
  meta.updateTag({ name: 'theme-color', content: seoData.themeColor });

  meta.updateTag({ property: 'og:site_name', content: seoData.siteName });
  meta.updateTag({ property: 'og:title', content: config.title });
  meta.updateTag({ property: 'og:description', content: config.description });
  meta.updateTag({ property: 'og:type', content: 'website' });
  meta.updateTag({ property: 'og:url', content: pageUrl });
  meta.updateTag({ property: 'og:locale', content: seoData.locale });

  meta.updateTag({ name: 'twitter:card', content: 'summary' });
  meta.updateTag({ name: 'twitter:title', content: config.title });
  meta.updateTag({ name: 'twitter:description', content: config.description });

  setLink(document, 'canonical', pageUrl);
  setLink(document, 'author', seoData.authorUrl);
}

function absolute(path: string): string {
  if (path === '/') {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}${path}`;
}

function setLink(document: Document, rel: string, href: string): void {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}
