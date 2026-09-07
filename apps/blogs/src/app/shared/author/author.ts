import seoData from '../../data/seo.json';

export interface AuthorLink {
  readonly kind: 'portfolio' | 'linkedin' | 'github';
  readonly label: string;
  readonly href: string;
}

const [portfolioHref, linkedInHref, githubHref] = seoData.sameAs;

export const AUTHOR = {
  name: seoData.author,
  url: seoData.authorUrl,
  jobTitle: seoData.authorJobTitle,
  image: seoData.authorImage.replace(/^\//, ''),
  links: [
    { kind: 'portfolio', label: 'Portfolio', href: portfolioHref },
    { kind: 'linkedin', label: 'LinkedIn', href: linkedInHref },
    { kind: 'github', label: 'GitHub', href: githubHref },
  ] as const satisfies readonly AuthorLink[],
} as const;
