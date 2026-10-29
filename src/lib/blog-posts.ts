import type { Source } from "./lesson-types";
import { post as p_whatIsAeo } from "./content/blog/what-is-aeo";
import { post as p_aeoVsSeoVsGeo } from "./content/blog/aeo-vs-seo-vs-geo";
import { post as p_howToLearnAeo } from "./content/blog/how-to-learn-aeo";
import { post as p_isAeoWorthLearning } from "./content/blog/is-aeo-worth-learning";
import { post as p_bestAeoCourses } from "./content/blog/best-aeo-courses";
import { post as p_howChatgptChoosesSources } from "./content/blog/how-chatgpt-chooses-sources";
import { post as p_getCitedInGoogleAiOverviews } from "./content/blog/get-cited-in-google-ai-overviews";
import { post as p_llmsTxtExplained } from "./content/blog/llms-txt-explained";

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
  /** Every factual claim in the post traces to one of these (listed under the post as "Sources"). */
  sources: Source[];
};

/** The launch posts, one data file each in src/lib/content/blog/ (sources checked 2026-10-28). */
export const blogPosts: BlogPost[] = [
  p_whatIsAeo, p_aeoVsSeoVsGeo, p_howToLearnAeo, p_isAeoWorthLearning, p_bestAeoCourses, p_howChatgptChoosesSources, p_getCitedInGoogleAiOverviews, p_llmsTxtExplained,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
