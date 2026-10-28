import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "structured-data",
  term: "Structured data",
  aka: ["Schema markup"],
  definition:
    "Structured data is machine-readable code on a page, usually schema.org vocabulary in JSON-LD, that labels what the page is about for search engines.",
  explanation:
    "Google defines it as \"a standardized format for providing information about a page and classifying the page content.\" Google Search supports JSON-LD, Microdata and RDFa, and says \"In general, Google recommends using JSON-LD for structured data if your site's setup allows it.\" Most of the vocabulary comes from schema.org, which major search engines including Google and Microsoft can read.\n\nFor AI search, keep expectations honest. Google's AI features docs say there's \"no special schema.org structured data that you need to add\" to appear in AI Overviews or AI Mode. What Google does ask is that your structured data matches the visible text on the page.\n\nSo use structured data for what it does well: stating plainly who you are and what a page describes. Organization markup, for example, lets you give your official name, URL, logo and `sameAs` links to your profiles on other sites, and Google says the `url` property helps it uniquely identify your organization. Never mark up anything users can't see.",
  example: {
    label: "Organization markup in JSON-LD (adapted from Google's example; brand made up)",
    language: "json",
    body: '{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Brightdesk",\n  "url": "https://www.brightdesk.example",\n  "logo": "https://www.brightdesk.example/images/logo.png",\n  "sameAs": [\n    "https://social.example/brightdesk",\n    "https://reviews.example/brightdesk"\n  ]\n}',
  },
  related: ["json-ld", "entity", "same-as", "knowledge-graph", "ai-overviews"],
  lesson: "structured-data-and-entities",
  sources: [
    {
      title: "Introduction to structured data markup in Google Search",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
      accessed: "2026-10-28",
      date: "2025-12-10",
      dateKind: "updated",
    },
    {
      title: "Organization structured data",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/structured-data/organization",
      accessed: "2026-10-28",
      date: "2026-09-08",
      dateKind: "updated",
    },
    {
      title: "Getting Started",
      publisher: "schema.org",
      url: "https://schema.org/docs/gs.html",
      accessed: "2026-10-28",
    },
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      accessed: "2026-10-28",
      date: "2025-12-10",
      dateKind: "updated",
    },
  ],
};
