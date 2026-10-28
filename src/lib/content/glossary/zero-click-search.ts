import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "zero-click-search",
  term: "Zero-click search",
  aka: ["Zero-click"],
  definition:
    "Zero-click search is a search that ends without the user clicking on any of the results shown on the search results page.",
  explanation:
    "SparkToro's 2024 study, using clickstream data from Datos, put it this way: \"Zero-click searches are defined as those that end without clicking on any of the results presented.\" It found that 58.5% of U.S. and 59.7% of EU Google searches in 2024 ended with zero clicks. SparkToro itself flags that the post may be out of date, and figures like these depend on the panel and on what counts as a click, so quote them with the year and source.\n\nAI answers make the idea more pressing. Google's AI Overviews put a summary on the results page, and answer engines such as Perplexity write the answer and attach citations. Google says that clicks from results pages with AI Overviews are higher quality, but it reports that traffic inside the overall Web numbers in Search Console rather than separately.\n\nFor you, zero-click means a search can shape a buying decision without showing up in your analytics. Count AI citations and brand mentions alongside clicks.",
  related: ["ai-overviews", "answer-engine", "brand-mention", "citation", "ai-share-of-voice"],
  lesson: "measuring-ai-visibility",
  sources: [
    {
      title:
        "2024 Zero-Click Search Study: For every 1,000 EU Google Searches, only 374 clicks go to the Open Web. In the US, it's 360.",
      publisher: "SparkToro",
      url: "https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/",
      accessed: "2026-10-28",
      date: "2024-07-02",
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
