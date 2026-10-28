import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "perplexitybot",
  term: "PerplexityBot",
  definition:
    "PerplexityBot is Perplexity's crawler for surfacing and linking websites in Perplexity's search results; Perplexity says it is not used to crawl content for AI foundation models.",
  explanation:
    "PerplexityBot is the bot that decides whether Perplexity can find and cite your pages. Perplexity says it \"is designed to surface and link websites in search results on Perplexity\" and that \"It is not used to crawl content for AI foundation models.\" Perplexity recommends allowing it in robots.txt.\n\nDo not confuse it with `Perplexity-User`, which supports user actions within Perplexity. Perplexity says that because a user requested the fetch, \"this fetcher generally ignores robots.txt rules.\" So a Disallow for Perplexity-User is not a dependable control, while a Disallow for PerplexityBot is the documented way to stay out of Perplexity's search results.\n\nAfter you change robots.txt, Perplexity says \"it may take up to 24 hours for our systems to reflect changes.\"\n\nIn your logs, the bot's user-agent string ends with `PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)`. Remember that a bot with its own robots.txt group ignores your `User-agent: *` rules, so repeat any paths you still want to keep private.",
  example: {
    label: "Let PerplexityBot in, but keep checkout private",
    language: "robots",
    body: "User-agent: PerplexityBot\nDisallow: /checkout/",
  },
  related: ["oai-searchbot", "robots-txt", "user-agent", "citation", "answer-engine"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "Perplexity Crawlers",
      publisher: "Perplexity",
      url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
      accessed: "2026-10-28",
    },
    {
      title: "RFC 9309: Robots Exclusion Protocol",
      publisher: "IETF (RFC Editor)",
      url: "https://www.rfc-editor.org/rfc/rfc9309.html",
      date: "2022-09",
      dateKind: "published",
      accessed: "2026-10-28",
    },
  ],
};
