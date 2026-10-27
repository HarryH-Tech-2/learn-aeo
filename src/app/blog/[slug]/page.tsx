import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, blogPosts } from "@/lib/blog-posts";
import { SITE as SITE_CONFIG } from "@/lib/site";
import BlogPostContent from "./BlogPostContent";
import { ArticleBody, QuickAnswer } from "./PostBody";
import { extractH2s, withInBodyLinks } from "../blog-text";
import { countWords, readingMinutes, stripMarkdown } from "../blog-text";

const SITE = SITE_CONFIG.url;
const BRAND_SUFFIX = " | Learn AEO";
/** Google shows roughly 60 characters of a title; only brand it when it still fits. */
const MAX_TITLE_LENGTH = 60;

const PUBLISHER = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "Learn AEO",
  url: SITE,
  logo: {
    "@type": "ImageObject",
    url: `${SITE}/favicon.png`,
  },
} as const;

function seoTitle(title: string): string {
  return title.length + BRAND_SUFFIX.length <= MAX_TITLE_LENGTH
    ? `${title}${BRAND_SUFFIX}`
    : title;
}

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

  const canonical = `${SITE}/blog/${slug}`;
  const imageUrl = `${SITE}${post.image}`;
  const modified = post.updatedAt ?? post.publishedAt;

  return {
    title: seoTitle(post.metaTitle ?? post.title),
    description: post.metaDescription ?? post.excerpt,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      type: "article",
      url: canonical,
      siteName: "Learn AEO",
      locale: "en_GB",
      publishedTime: post.publishedAt,
      modifiedTime: modified,
      section: post.category,
      images: [
        {
          url: imageUrl,
          width: 1024,
          height: 1024,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      images: [imageUrl],
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
  const content = post ? withInBodyLinks(post.content) : "";
  const imageUrl = post ? `${SITE}${post.image}` : undefined;

  const articleJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        url: canonical,
        headline: post.title,
        name: post.title,
        description: post.excerpt,
        // Answer-first summary — the passage AI assistants and featured snippets can lift verbatim.
        abstract: stripMarkdown(post.quickAnswer),
        image: imageUrl
          ? {
              "@type": "ImageObject",
              url: imageUrl,
              width: 1024,
              height: 1024,
              caption: post.imageAlt,
            }
          : undefined,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonical,
        },
        publisher: PUBLISHER,
        isPartOf: {
          "@type": "Blog",
          "@id": `${SITE}/blog#blog`,
          name: "The Learn AEO Blog",
          url: `${SITE}/blog`,
        },
        articleSection: post.category,
        keywords: [
          post.category,
          "answer engine optimisation",
          "AEO",
          "AI search",
        ].join(", "),
        wordCount: countWords(content),
        timeRequired: `PT${readingMinutes(content)}M`,
        inLanguage: "en",
        isAccessibleForFree: true,
        // The quick-answer block is the passage a voice assistant should read aloud.
        // Both selectors exist in BlogPostContent.tsx.
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#quick-answer-text", "h1"],
        },
      }
    : null;

  const faqJsonLd =
    post && post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${canonical}#faq`,
          mainEntity: post.faqs.map((f) => ({
            "@type": "Question",
            name: stripMarkdown(f.question),
            acceptedAnswer: {
              "@type": "Answer",
              text: stripMarkdown(f.answer),
            },
          })),
        }
      : null;

  const breadcrumbJsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonical,
          },
        ],
      }
    : null;

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <BlogPostContent
        post={
          post
            ? {
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
              }
            : null
        }
        headings={post ? extractH2s(content) : []}
        minutes={post ? readingMinutes(content) : 0}
        related={
          post
            ? post.relatedSlugs
                .map((s) => blogPosts.find((p) => p.slug === s))
                .filter((p): p is NonNullable<typeof p> => !!p)
                .map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt }))
            : []
        }
        quickAnswer={post ? <QuickAnswer md={post.quickAnswer} /> : null}
        body={post ? <ArticleBody md={content} /> : null}
      />
    </>
  );
}
