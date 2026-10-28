import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "same-as",
  term: "sameAs",
  definition:
    "sameAs is a schema.org property holding the URL of a reference web page that unambiguously indicates an item's identity, such as your brand's official profiles elsewhere.",
  explanation:
    "sameAs is how your structured data says \"this organization is the same one as these other pages\". schema.org defines it as the \"URL of a reference Web page that unambiguously indicates the item's identity\". It sits on `Thing`, so any type, including Organization, Person and Product, can use it. schema.org's examples are \"the URL of the item's Wikipedia page, Wikidata entry, or official website.\"\n\nGoogle's Organization documentation describes it as \"The URL of a page on another website with additional information about your organization\" and says \"You can provide multiple `sameAs` URLs.\" Google says Organization markup can help it \"disambiguate your organization in search results.\"\n\nFor a marketer, sameAs is the link between your site and the profiles that already describe you: your Wikipedia or Wikidata entry if you have one, and your official social and directory profiles. List only pages that are really about you and that you would stand behind. A wrong or stale link points engines at a different identity.",
  example: {
    label: "sameAs on an Organization (example URLs are placeholders)",
    language: "json",
    body: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"Example Garden Supply\",\n  \"url\": \"https://www.example.com\",\n  \"sameAs\": [\n    \"https://example.net/profile/example1234\",\n    \"https://example.org/example1234\"\n  ]\n}",
  },
  related: ["entity", "json-ld", "structured-data", "knowledge-graph", "brand-mention"],
  lesson: "structured-data-and-entities",
  sources: [
    {
      title: "sameAs",
      publisher: "Schema.org",
      url: "https://schema.org/sameAs",
      date: "2026-09-16",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Thing",
      publisher: "Schema.org",
      url: "https://schema.org/Thing",
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
