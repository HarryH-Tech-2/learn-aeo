import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "knowledge-graph",
  term: "Knowledge Graph",
  question: "What is the Knowledge Graph?",
  aka: ["Google Knowledge Graph"],
  definition:
    "The Knowledge Graph is Google's database of billions of facts about people, places and things, which powers features such as knowledge panels in Google Search.",
  explanation:
    "The Knowledge Graph is where Google keeps what it knows about entities, including, possibly, your brand. Google's help page calls it \"our database of billions of facts about people, places, and things.\" When Google announced it in May 2012, it said the graph held more than 500 million objects and more than 3.5 billion facts, and summed up the idea as \"things, not strings.\"\n\nWhere the facts come from, per Google: \"a variety of sources that compile factual information\", data Google licenses, and facts received directly from content owners. Knowledge panels are \"created automatically\" by Google when there is enough information about an entity on the open web.\n\nWhat a marketer can do:\n\n- If a panel exists for your organization or a person you represent, an official representative can claim it and suggest changes. Businesses manage their details through Business Profile.\n- Use Organization structured data. Google says it can help Google \"disambiguate your organization in search results\" and can influence elements such as the logo in your knowledge panel.\n\nGoogle's Knowledge Graph Search API lets you look up entities in the graph, though Google says it is not suitable for production-critical use.",
  related: ["entity", "same-as", "json-ld", "structured-data", "e-e-a-t"],
  lesson: "structured-data-and-entities",
  sources: [
    {
      title: "How Google's Knowledge Graph works",
      publisher: "Knowledge Panel Help (Google)",
      url: "https://support.google.com/knowledgepanel/answer/9787176",
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
      title: "Google Knowledge Graph Search API",
      publisher: "Google for Developers",
      url: "https://developers.google.com/knowledge-graph",
      date: "2024-04-26",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
  ],
};
