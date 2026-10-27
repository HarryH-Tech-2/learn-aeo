export type BlogFAQ = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  /** The search-result title, when it should differ from the on-page title. */
  metaTitle?: string;
  excerpt: string;
  /** The search-result description, when it should differ from the excerpt shown on cards. */
  metaDescription?: string;
  /**
   * A direct, 1–3 sentence answer to the question the post title poses.
   * Rendered first on the page and used as the Article `abstract` so search
   * engines and AI assistants can quote it verbatim.
   */
  quickAnswer: string;
  date: string;
  /** ISO-8601 publish date (YYYY-MM-DD). Used for sitemap lastmod and Article JSON-LD. */
  publishedAt: string;
  /**
   * ISO-8601 date of the last substantive revision. Set this when you actually
   * change the content — it drives sitemap lastmod, Article dateModified and the
   * visible "Updated …" line. Leave unset for untouched posts.
   */
  updatedAt?: string;
  category: string;
  image: string;
  imageAlt: string;
  relatedSlugs: string[];
  faqs: BlogFAQ[];
  content: string;
};

/** No posts yet: the first AEO articles are still to be written. /blog shows a coming-soon page meanwhile. */
export const blogPosts: BlogPost[] = [];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
