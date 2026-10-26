import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import BlogContent from "./BlogContent";
import { countWords, stripMarkdown } from "./blog-text";

const SITE = "https://www.learnhieroglyphics.com";
const BLOG_URL = `${SITE}/blog`;
const BLOG_NAME = "The Scribe's Journal";
const BLOG_DESCRIPTION =
  "Articles on ancient Egyptian hieroglyphics: how to learn them, the hieroglyphic alphabet, the Rosetta Stone, royal cartouches, scribal culture and the Book of the Dead.";

/** Newest first, by publish date; the index card grid uses the same order. */
const sortedPosts = [...blogPosts].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt)
);

/** Only what the cards render; the markdown bodies stay on the server. */
const summaries = sortedPosts.map(({ slug, title, excerpt, date, publishedAt, updatedAt, category, glyph, image, imageAlt }) => ({
  slug, title, excerpt, date, publishedAt, updatedAt, category, glyph, image, imageAlt,
}));

const latestModified = blogPosts.reduce<string>((max, post) => {
  const d = post.updatedAt ?? post.publishedAt;
  return d > max ? d : max;
}, "");

export const metadata: Metadata = {
  title: "Hieroglyphics Articles & Guides | Learn Hieroglyphics",
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: BLOG_URL,
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: `${BLOG_NAME}: Hieroglyphics Articles & Guides`,
    description: BLOG_DESCRIPTION,
    type: "website",
    url: BLOG_URL,
    siteName: "Learn Hieroglyphics",
    locale: "en_GB",
    images: [
      {
        url: `${SITE}/og-homepage.jpg`,
        width: 1200,
        height: 630,
        alt: "Learn Hieroglyphics - The Scribe's Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BLOG_NAME}: Hieroglyphics Articles & Guides`,
    description: BLOG_DESCRIPTION,
    images: [`${SITE}/og-homepage.jpg`],
  },
};

export default function BlogPage() {
  const author = {
    "@type": "Person",
    "@id": `${SITE}/about#harry-harrison`,
    name: "Harry Harrison",
    url: `${SITE}/about`,
  };

  const publisher = {
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "Learn Hieroglyphics",
    url: SITE,
    logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
    ],
  };

  // CollectionPage (the URL) whose main entity is the Blog (the publication).
  // Each BlogPosting here is a summary; the full node lives on the post page
  // and shares the same @id so the graph links up.
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": BLOG_URL,
    url: BLOG_URL,
    name: `${BLOG_NAME}: Hieroglyphics Articles & Guides`,
    description: BLOG_DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Learn Hieroglyphics" },
    dateModified: latestModified,
    publisher,
    mainEntity: {
      "@type": "Blog",
      "@id": `${BLOG_URL}#blog`,
      name: BLOG_NAME,
      url: BLOG_URL,
      description: BLOG_DESCRIPTION,
      inLanguage: "en",
      author,
      publisher,
      blogPost: sortedPosts.map((post) => ({
        "@type": "BlogPosting",
        "@id": `${SITE}/blog/${post.slug}#article`,
        url: `${SITE}/blog/${post.slug}`,
        mainEntityOfPage: `${SITE}/blog/${post.slug}`,
        headline: post.title,
        description: post.excerpt,
        abstract: stripMarkdown(post.quickAnswer),
        articleSection: post.category,
        wordCount: countWords(post.content),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        image: `${SITE}${post.image}`,
        author,
        publisher,
        isAccessibleForFree: true,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <BlogContent posts={summaries} />
    </>
  );
}
