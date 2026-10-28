import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "entity",
  term: "Entity",
  definition:
    "An entity is a real-world thing, such as a person, place, organization or product, that search systems recognize as distinct, rather than as a string of words.",
  explanation:
    "An entity is a thing, not a keyword. When Google launched its Knowledge Graph in 2012, it framed the shift as \"things, not strings\". Google's Knowledge Graph Search API describes the graph as having \"millions of entries that describe real-world entities like people, places, and things\", typed with schema.org types such as Organization, Person and Place.\n\nFor your brand, being a clear entity means engines can tell *your* company apart from others with a similar name and connect facts to it. Google says Organization structured data can help it \"disambiguate your organization in search results\".\n\nPractical steps that follow from the sources:\n\n- Describe your organization (and key people and products) with schema.org structured data in JSON-LD.\n- Use `sameAs` to point to reference pages that unambiguously identify you, such as a Wikipedia page, Wikidata entry or official website.\n\nIf Google has a knowledge panel for your organization, an official representative can claim it and suggest changes.",
  related: ["knowledge-graph", "same-as", "json-ld", "structured-data", "brand-mention"],
  lesson: "structured-data-and-entities",
  sources: [
    {
      title: "Google Knowledge Graph Search API",
      publisher: "Google for Developers",
      url: "https://developers.google.com/knowledge-graph",
      date: "2024-04-26",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Introducing the Knowledge Graph: things, not strings",
      publisher: "Google (The Keyword)",
      url: "https://blog.google/products/search/introducing-knowledge-graph-things-not/",
      date: "2012-05-16",
      dateKind: "published",
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
    {
      title: "How Google's Knowledge Graph works",
      publisher: "Knowledge Panel Help (Google)",
      url: "https://support.google.com/knowledgepanel/answer/9787176",
      accessed: "2026-10-28",
    },
    {
      title: "sameAs",
      publisher: "Schema.org",
      url: "https://schema.org/sameAs",
      date: "2026-09-16",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
  ],
};
