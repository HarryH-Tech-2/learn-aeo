import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { SITE as SITE_CONFIG } from "@/lib/site";
import BlogContent from "./BlogContent";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { blogCollectionSchema, breadcrumbSchema } from "@/lib/schema";
import { countWords, stripMarkdown, withInBodyLinks } from "./blog-text";

const SITE = SITE_CONFIG.url;
const BLOG_DESCRIPTION =
  "Articles on answer engine optimization for marketers: how ChatGPT and other AI search tools choose their sources, and how to get your brand cited by them.";

/** Newest first, by publish date; the index card grid uses the same order. */
const sortedPosts = [...blogPosts].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

/** Only what the cards render; the markdown bodies stay on the server. */
const summaries = sortedPosts.map(({ slug, title, excerpt, date, publishedAt, updatedAt, category, image, imageAlt }) => ({
  slug, title, excerpt, date, publishedAt, updatedAt, category, image, imageAlt,
}));

const latestModified = blogPosts.reduce<string | undefined>((max, post) => {
  const d = post.updatedAt ?? post.publishedAt;
  return max === undefined || d > max ? d : max;
}, undefined);

/** With no posts the index is a coming-soon page, which should not be indexed. */
const hasPosts = blogPosts.length > 0;

export const metadata: Metadata = pageMetadata({
  title: "Answer engine optimization articles",
  description: BLOG_DESCRIPTION,
  path: "/blog",
  noindex: !hasPosts,
});

export default function BlogPage() {
  // CollectionPage (the URL) whose main entity is the Blog (the publication). Each BlogPosting here
  // is a summary; the full node lives on the post page and shares the same @id so the graph links up.
  const collection = blogCollectionSchema({
    description: BLOG_DESCRIPTION,
    dateModified: latestModified ?? null,
    posts: sortedPosts.map((post) => ({
      url: `${SITE}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      abstract: stripMarkdown(post.quickAnswer),
      section: post.category,
      // the post page counts the rendered body, in-body links included; the two share an @id
      wordCount: countWords(withInBodyLinks(post.content)),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      image: `${SITE}${post.image}`,
    })),
  });

  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]), collection]} />
      <BlogContent posts={summaries} />
    </>
  );
}
