import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "ai-mode",
  term: "AI Mode",
  definition:
    "AI Mode is Google's AI search experience for complex, multi-part questions, answering with a generated response and links to supporting websites.",
  explanation:
    "AI Mode sits alongside the classic results page and is built for longer questions. Google's docs say it is \"particularly helpful for queries where further exploration, reasoning, or complex comparisons are needed\". When it rolled out to everyone in the U.S. in May 2025, Google called it \"our most powerful AI search, with more advanced reasoning and multimodality\".\n\nThe key mechanism for you is query fan-out. Google says AI Mode works by \"breaking down your question into subtopics and issuing a multitude of queries simultaneously on your behalf\". A page that clearly answers one subtopic can be linked even if it would never rank for the full question.\n\nThe eligibility rules are the same as for AI Overviews: the page must be indexed and eligible to be shown with a snippet, and Google says there are no additional technical requirements. Traffic from AI Mode is counted in Search Console's overall Web search traffic, not in a separate report.",
  related: ["ai-overviews", "query-fan-out", "answer-engine", "citation"],
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
  ],
};
