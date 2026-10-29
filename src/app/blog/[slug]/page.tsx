import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, blogPosts } from "@/lib/blog-posts";
import { SITE as SITE_CONFIG } from "@/lib/site";
import BlogPostContent from "./BlogPostContent";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { blogPostingSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { ArticleBody, PostSources, QuickAnswer } from "./PostBody";
import { extractH2s, withInBodyLinks } from "../blog-text";
import { countWords, readingMinutes, stripMarkdown } from "../blog-text";

const SITE = SITE_CONFIG.url;
const BRAND_SUFFIX = " | Learn AEO";
/** Google shows roughly 60 characters of a title; only brand it when it still fits. */
const MAX_TITLE_LENGTH = 60;


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Learn AEO",
      robots: { index: false, follow: true },
    };
  }

  const imageUrl = `${SITE}${post.image}`;
  const modified = post.updatedAt ?? post.publishedAt;
  const title = post.metaTitle ?? post.title;
  const base = pageMetadata({
    title,
    // Google shows roughly 60 characters of a title: only add the brand when it still fits.
    absoluteTitle: title.length + BRAND_SUFFIX.length > MAX_TITLE_LENGTH,
    description: post.metaDescription ?? post.excerpt,
    path: `/blog/${slug}`,
    type: "article",
    image: imageUrl,
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: modified,
      section: post.category,
      images: [{ url: imageUrl, width: 1024, height: 1024, alt: post.imageAlt }],
    },
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const canonical = `${SITE}/blog/${slug}`;
  // The rendered body carries the in-body link to the free lesson.
  const content = withInBodyLinks(post.content);
  const imageUrl = `${SITE}${post.image}`;

  const article = blogPostingSchema({
    url: canonical,
    title: post.title,
    description: post.excerpt,
    abstract: stripMarkdown(post.quickAnswer),
    image: { url: imageUrl, width: 1024, height: 1024, caption: post.imageAlt },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    section: post.category,
    wordCount: countWords(content),
    minutes: readingMinutes(content),
  });
  const faq =
    post.faqs.length > 0
      ? faqSchema(
          post.faqs.map((f) => ({ question: stripMarkdown(f.question), answer: stripMarkdown(f.answer) })),
          `${canonical}#faq`
        )
      : null;
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={faq ? [article, faq, breadcrumbs] : [article, breadcrumbs]} />
      <BlogPostContent
        post={{
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          date: post.date,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          category: post.category,
          image: post.image,
          imageAlt: post.imageAlt,
          faqs: post.faqs,
        }}
        headings={extractH2s(content)}
        minutes={readingMinutes(content)}
        related={post.relatedSlugs
          .map((s) => blogPosts.find((p) => p.slug === s))
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt }))}
        quickAnswer={<QuickAnswer md={post.quickAnswer} />}
        body={<ArticleBody md={content} />}
        sources={<PostSources sources={post.sources} />}
      />
    </>
  );
}
