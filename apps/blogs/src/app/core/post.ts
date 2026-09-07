export const TAGS = [
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
] as const;

export type Tag = (typeof TAGS)[number];

export const TAG_LABELS: Record<Tag, string> = {
  angular: 'Angular',
  javascript: 'JavaScript',
  frontend: 'Front-end',
  'micro-front-end': 'Micro front-end',
  seo: 'SEO',
  'ssr-ssg': 'SSR/SSG',
  node: 'Node.js',
  go: 'Go',
  backend: 'Back-end',
  mcp: 'MCP',
  ai: 'AI',
};

export interface Post {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  date: string;
  updated: string;
  mainTag: Tag;
  tags: Tag[];
  image: string | null;
  banner: string;
  seoImage: string;
  wordCount: number;
  draft: boolean;
}

export interface PostsFile {
  generatedAt: string;
  posts: Post[];
}
