import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "ai-overviews",
  term: "AI Overviews",
  definition:
    "AI Overviews are AI-generated summaries that Google shows in some search results, with links to the web pages that support the answer.",
  explanation:
    "AI Overviews appear inside normal Google Search results for some queries. Google began rolling them out to everyone in the U.S. in May 2024, saying \"Search will do the work for you with AI Overviews\", with links to learn more.\n\nYou don't need anything special to be eligible. Google's Search Central docs say a page must be \"indexed and eligible to be shown in Google Search with a snippet\", and that there is no special schema.org structured data to add. Under the hood, AI Overviews may use query fan-out: several related searches across subtopics, so a page can be linked for one part of a question.\n\nFor measurement, Google says sites that appear in AI features \"are included in the overall search traffic in Search Console\", in the Performance report under the Web search type. They are not broken out separately, so you'll need to compare queries and pages over time or track the answers directly.",
  related: ["ai-mode", "query-fan-out", "zero-click-search", "citation", "answer-engine"],
  lesson: "how-answer-engines-choose-sources",
  sources: [
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      accessed: "2026-10-28",
      date: "2025-12-10",
      dateKind: "updated",
    },
    {
      title: "Generative AI in Search: Let Google do the searching for you",
      publisher: "Google",
      url: "https://blog.google/products/search/generative-ai-google-search-may-2024/",
      accessed: "2026-10-28",
      date: "2024-05-14",
      dateKind: "published",
    },
  ],
};
