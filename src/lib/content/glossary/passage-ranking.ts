import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "passage-ranking",
  term: "Passage ranking",
  definition:
    "Passage ranking is Google's AI system for judging individual sections, or passages, of a web page to understand how relevant the page is to a search.",
  explanation:
    "In October 2020, Google announced a ranking change for passages. Its point was that the one sentence that answers a specific question may be buried deep in a long page, so Google's systems began judging the relevance of individual passages, not only whole pages. Google said at the time: \"This technology will improve 7 percent of search queries across all languages as we roll it out globally.\" It still lists a passage ranking system in its guide to ranking systems.\n\nNote the wording in Google's current guide: passages are used to understand how relevant a page is to a search. The page is still what appears in classic results; the passage helps decide where.\n\nThe same passage-level view runs through AI search. Claude's web search citations, for example, carry up to 150 characters of the cited text: a sentence or two, not a page. For you, that means one clear, self-contained paragraph on a long page can do real work. Put the answer to each likely question in its own passage, naming the subject and giving the figure in the same sentence.",
  related: ["citation", "rag", "query-fan-out", "grounding"],
  lesson: "writing-citable-content",
  sources: [
    {
      title: "A guide to Google Search ranking systems",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ranking-systems-guide",
      accessed: "2026-10-28",
      date: "2025-12-10",
      dateKind: "updated",
    },
    {
      title: "How AI is powering a more helpful Google",
      publisher: "Google",
      url: "https://blog.google/products-and-platforms/products/search/search-on/",
      accessed: "2026-10-28",
      date: "2020-10-15",
      dateKind: "published",
    },
    {
      title: "Web search tool",
      publisher: "Anthropic",
      url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
      accessed: "2026-10-28",
    },
  ],
};
