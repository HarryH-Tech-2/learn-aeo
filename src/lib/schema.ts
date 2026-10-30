// Schema.org JSON-LD builders: the one place structured data is shaped. Entities link by
// @id: the Organization (defined once, in the root layout), the WebSite, and the Course
// (on home and pricing). Render with <JsonLd data={...} /> (src/components/JsonLd.tsx),
// which adds @context and escapes the output.
// No Person anywhere: the course and posts are credited to the Learn AEO organization.

import { SITE, absoluteUrl } from "./site";
import { LESSON_CATALOG, TOTAL_MINUTES, lessonPath } from "./lesson-catalog";
import type { LessonMeta } from "./lesson-types";
import { PLANS, PLAN_IDS } from "./plans";
import { toolPath, type ToolMeta } from "./tools";
import type { GlossaryTerm } from "./glossary-types";

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const COURSE_ID = `${SITE.url}/#course`;

// A reference that names the Organization too: validators may not join @ids across the page's
// separate JSON-LD blocks, and Course info / Article rich results want provider.name, author.name.
const ORG_REF = { "@type": "Organization", "@id": ORG_ID, name: SITE.name, url: SITE.url };
const LANGUAGE = "en-US";

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/icon-512.png"),
    description: SITE.description,
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    publisher: ORG_REF,
    inLanguage: LANGUAGE,
  };
}

const COURSE_DESCRIPTION =
  "Online course for marketers who know SEO on answer engine optimization (AEO): how ChatGPT, Perplexity, Google AI Overviews and other AI search tools choose sources, how to let AI crawlers reach your site, and how to write passages they can cite.";

export function courseSchema() {
  return {
    "@type": "Course",
    "@id": COURSE_ID,
    name: SITE.name,
    description: COURSE_DESCRIPTION,
    url: SITE.url,
    provider: ORG_REF,
    inLanguage: LANGUAGE,
    isAccessibleForFree: false,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${TOTAL_MINUTES}M`,
    },
    offers: PLAN_IDS.map((id) => ({
      "@type": "Offer",
      name: PLANS[id].name,
      // Google's Course info categories: a one-time payment is "Paid", monthly is "Subscription".
      category: PLANS[id].mode === "subscription" ? "Subscription" : "Paid",
      price: String(PLANS[id].usd),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/pricing"),
    })),
    syllabusSections: LESSON_CATALOG.filter((l) => l.status === "live").map((l) => ({
      "@type": "Syllabus",
      name: l.title,
      description: l.summary,
      url: absoluteUrl(lessonPath(l.id)),
      timeRequired: `PT${l.minutes}M`,
    })),
  };
}

export function learningResourceSchema(lesson: LessonMeta) {
  return {
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.description,
    url: absoluteUrl(lessonPath(lesson.id)),
    educationalLevel: lesson.level,
    learningResourceType: "Lesson",
    timeRequired: `PT${lesson.minutes}M`,
    inLanguage: LANGUAGE,
    isAccessibleForFree: lesson.isFree,
    isPartOf: { "@id": COURSE_ID },
    provider: ORG_REF,
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[], id?: string) {
  return {
    "@type": "FAQPage",
    ...(id ? { "@id": id } : {}),
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export type BlogPostingInput = {
  url: string;
  title: string;
  description: string;
  /** The answer-first summary: the passage assistants and snippets can lift. */
  abstract: string;
  image: { url: string; width: number; height: number; caption: string };
  datePublished: string;
  dateModified: string;
  section: string;
  wordCount: number;
  minutes: number;
};

const BLOG_ID = `${SITE.url}/blog#blog`;
const BLOG_NAME = "The Learn AEO Blog";

/** A full BlogPosting for the post page. Credited to the Organization. */
export function blogPostingSchema(p: BlogPostingInput) {
  return {
    "@type": "BlogPosting",
    "@id": `${p.url}#article`,
    url: p.url,
    headline: p.title,
    name: p.title,
    description: p.description,
    abstract: p.abstract,
    image: { "@type": "ImageObject", ...p.image },
    datePublished: p.datePublished,
    dateModified: p.dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": p.url },
    author: ORG_REF,
    publisher: ORG_REF,
    isPartOf: { "@id": BLOG_ID },
    articleSection: p.section,
    keywords: [p.section, "answer engine optimization", "AEO", "AI search"].join(", "),
    wordCount: p.wordCount,
    timeRequired: `PT${p.minutes}M`,
    inLanguage: LANGUAGE,
    isAccessibleForFree: true,
    // The quick-answer block is the passage a voice assistant should read aloud (BlogPostContent.tsx).
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["#quick-answer-text", "h1"] },
  };
}

/** The blog index: a CollectionPage whose main entity is the Blog, with a summary per post. */
export function blogCollectionSchema(o: {
  description: string;
  dateModified: string | null;
  posts: (Omit<BlogPostingInput, "image" | "minutes"> & { image: string })[];
}) {
  const url = absoluteUrl("/blog");
  return {
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: `${BLOG_NAME}: Answer Engine Optimization Articles`,
    description: o.description,
    inLanguage: LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    ...(o.dateModified ? { dateModified: o.dateModified } : {}),
    publisher: ORG_REF,
    mainEntity: {
      "@type": "Blog",
      "@id": BLOG_ID,
      name: BLOG_NAME,
      url,
      description: o.description,
      inLanguage: LANGUAGE,
      publisher: ORG_REF,
      blogPost: o.posts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${p.url}#article`,
        url: p.url,
        mainEntityOfPage: p.url,
        headline: p.title,
        description: p.description,
        abstract: p.abstract,
        articleSection: p.section,
        wordCount: p.wordCount,
        datePublished: p.datePublished,
        dateModified: p.dateModified,
        image: p.image,
        author: ORG_REF,
        publisher: ORG_REF,
        isAccessibleForFree: true,
      })),
    },
  };
}

/** A free tool page (/tools/<slug>). */
export function webApplicationSchema(tool: ToolMeta) {
  return {
    "@type": "WebApplication",
    name: tool.name,
    description: tool.summary,
    url: absoluteUrl(toolPath(tool.slug)),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: ORG_REF,
    inLanguage: LANGUAGE,
  };
}

/** An ordered list of pages, e.g. the tools on /tools. */
export function itemListSchema(name: string, items: { name: string; path: string }[]) {
  return {
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
  };
}

export const GLOSSARY_ID = `${SITE.url}/glossary#terms`;

/** One glossary term (/glossary/<slug>). */
export function definedTermSchema(t: GlossaryTerm) {
  return {
    "@type": "DefinedTerm",
    "@id": `${absoluteUrl(`/glossary/${t.slug}`)}#term`,
    name: t.term,
    ...(t.aka?.length ? { alternateName: t.aka } : {}),
    description: t.definition,
    url: absoluteUrl(`/glossary/${t.slug}`),
    inDefinedTermSet: { "@id": GLOSSARY_ID },
  };
}

/** The whole glossary (/glossary). */
export function definedTermSetSchema(terms: readonly GlossaryTerm[]) {
  return {
    "@type": "DefinedTermSet",
    "@id": GLOSSARY_ID,
    name: "AEO glossary",
    url: absoluteUrl("/glossary"),
    publisher: ORG_REF,
    inLanguage: LANGUAGE,
    hasDefinedTerm: terms.map(definedTermSchema),
  };
}
