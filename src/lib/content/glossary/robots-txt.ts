import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "robots-txt",
  term: "robots.txt",
  aka: ["Robots Exclusion Protocol"],
  definition:
    "robots.txt is a plain-text file at the root of a site that tells crawlers, by user-agent token, which URLs they may fetch, as standardized in RFC 9309.",
  explanation:
    "robots.txt is where you say yes or no to each AI crawler. Google sums it up: \"A robots.txt file tells search engine crawlers which URLs the crawler can access on your site.\" RFC 9309 says the file must be named \"/robots.txt\" (all lowercase) in the top-level path of the service.\n\nThe file is made of groups: one or more `User-agent` lines followed by `Allow` and `Disallow` rules. A crawler matches its product token case-insensitively and obeys that group. Only \"If no matching group exists\" does it fall back to the `User-agent: *` group. That is why giving a bot its own group can quietly drop your `*` rules for it.\n\nThree limits matter:\n\n- It controls **crawling, not indexing**. Google says it is \"not a mechanism for keeping a web page out of Google\" and recommends `noindex` instead.\n- It is not security. RFC 9309: \"These rules are not a form of access authorization.\"\n- What a block means is set by each operator. A Disallow for `GPTBot` is a training opt-out; a Disallow for `OAI-SearchBot` removes you from ChatGPT search answers.",
  example: {
    label: "Block one training crawler, keep checkout private for everyone else",
    language: "robots",
    body: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /checkout/",
  },
  related: ["user-agent", "gptbot", "oai-searchbot", "claudebot", "perplexitybot", "google-extended", "llms-txt"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "RFC 9309: Robots Exclusion Protocol",
      publisher: "IETF (RFC Editor)",
      url: "https://www.rfc-editor.org/rfc/rfc9309.html",
      date: "2022-09",
      dateKind: "published",
      accessed: "2026-10-28",
    },
    {
      title: "Introduction to robots.txt",
      publisher: "Google Search Central",
      url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
      date: "2025-12-10",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
      accessed: "2026-10-28",
    },
  ],
};
