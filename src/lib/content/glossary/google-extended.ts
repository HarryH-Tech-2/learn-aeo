import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "google-extended",
  term: "Google-Extended",
  definition:
    "Google-Extended is a robots.txt product token, not a separate crawler, that controls whether content Google crawls may be used to train future Gemini models and for grounding.",
  explanation:
    "Google-Extended is a control, not a bot. Google says it \"doesn't have a separate HTTP request user agent string\" and that \"the robots.txt user-agent token is used in a control capacity.\" Crawling is done by Google's existing crawlers, so you will never see Google-Extended in your logs.\n\n**What it controls:** whether content Google crawls from your site \"may be used for training future generations of Gemini models\", and its use for grounding in Gemini Apps and Grounding with Google Search on Vertex AI.\n\n**What it does not control:** Google says it \"does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.\" For AI features in Search, such as AI Overviews and AI Mode, Google's AI features guide says robots.txt directives for Googlebot are the control for access.\n\nSo disallowing Google-Extended is a Gemini training and grounding decision. It is not a way to leave, or to join, AI Overviews. To limit what Search shows from your pages, Google points to snippet controls such as `nosnippet` and `max-snippet`.",
  example: {
    label: "Opt out of Gemini training and grounding, stay in Google Search",
    language: "robots",
    body: "User-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nDisallow: /checkout/",
  },
  related: ["robots-txt", "user-agent", "ai-overviews", "ai-mode", "grounding", "gptbot"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "Google's common crawlers",
      publisher: "Google Crawling Infrastructure",
      url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
      date: "2026-10-15",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "AI features and your website",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
  ],
};
