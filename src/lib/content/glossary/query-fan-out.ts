import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "query-fan-out",
  term: "Query fan-out",
  definition:
    "Query fan-out is a technique where an AI search system splits one question into several related searches across subtopics, then combines the results into one answer.",
  explanation:
    "Google names the technique directly. When AI Mode rolled out in the U.S., Google said it works by \"breaking down your question into subtopics and issuing a multitude of queries simultaneously on your behalf\". Its Search Central docs say both AI Overviews and AI Mode may use query fan-out to build a response.\n\nYou can see the same pattern from the developer side. Google's Gemini grounding docs say \"A single prompt might lead to one or more search queries.\" Anthropic's docs say Claude's search step \"can repeat multiple times throughout a single request\".\n\nWhat this means for you: a page can be cited for one sub-question even if it would never rank for the full, long prompt. Each subtopic you answer clearly on a page is another way in. Google does not publish the sub-queries it runs, so treat any list of \"fan-out queries\" from a tool as an estimate, not a log.",
  related: ["ai-mode", "ai-overviews", "grounding", "passage-ranking", "citation"],
  lesson: "how-answer-engines-choose-sources",
  sources: [
    {
      title: "AI in Search: Going beyond information to intelligence",
      publisher: "Google",
      url: "https://blog.google/products-and-platforms/products/search/google-search-ai-mode-update/",
      accessed: "2026-10-28",
      date: "2025-05-20",
      dateKind: "published",
    },
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      accessed: "2026-10-28",
      date: "2025-12-10",
      dateKind: "updated",
    },
    {
      title: "Grounding with Google Search",
      publisher: "Google Cloud",
      url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/grounding/grounding-with-google-search",
      accessed: "2026-10-28",
      date: "2026-10-28",
      dateKind: "updated",
    },
    {
      title: "Web search tool",
      publisher: "Anthropic",
      url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool",
      accessed: "2026-10-28",
    },
  ],
};
