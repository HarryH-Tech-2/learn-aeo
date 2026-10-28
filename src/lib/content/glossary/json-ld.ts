import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "json-ld",
  term: "JSON-LD",
  aka: ["JSON for Linked Data"],
  definition:
    "JSON-LD is a lightweight Linked Data format based on JSON, and the structured data format Google recommends for describing a page's content to search engines.",
  explanation:
    "JSON-LD is the format to use for structured data on most sites. Google supports JSON-LD, Microdata and RDFa, but says \"In general, Google recommends using JSON-LD for structured data if your site's setup allows it\", calling it the easiest to implement and maintain at scale.\n\nIn practice it is a block of JSON in a `<script type=\"application/ld+json\">` tag, separate from the visible HTML, as in Google's own examples. Google also advises putting structured data on the page it describes, and not marking up information users cannot see.\n\nThe json-ld.org project describes it as \"a lightweight Linked Data format\" that is \"easy for humans to read and write\", and lists its W3C Recommendations (Syntax, Processing Algorithms and API, Framing).\n\nThe vocabulary you write with is usually schema.org: `@context` points to it, `@type` names the kind of thing (Organization, Product, Article), and properties such as `name`, `url` and `sameAs` describe it. Google notes that structured data which does not follow its guidelines may be ineligible for rich results, so keep the markup true to what the page shows.",
  example: {
    label: "A minimal Organization block (example.com is a placeholder)",
    language: "json",
    body: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"Example Garden Supply\",\n  \"url\": \"https://www.example.com\"\n}",
  },
  related: ["structured-data", "entity", "same-as", "knowledge-graph"],
  lesson: "structured-data-and-entities",
  sources: [
    {
      title: "JSON for Linking Data",
      publisher: "json-ld.org",
      url: "https://json-ld.org/",
      accessed: "2026-10-28",
    },
    {
      title: "Introduction to structured data markup in Google Search",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Organization (Organization) structured data",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/structured-data/organization",
      date: "2026-09-08",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
  ],
};
