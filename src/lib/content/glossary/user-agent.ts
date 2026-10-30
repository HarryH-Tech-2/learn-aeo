import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "user-agent",
  term: "User agent",
  question: "What is a user agent?",
  aka: ["User-Agent header", "user-agent token"],
  definition:
    "A user agent is the name a crawler or browser identifies itself by: a full string in the HTTP User-Agent header, and a shorter product token used in robots.txt.",
  explanation:
    "You meet user agents in two places, and they are not the same thing.\n\n- **In requests and logs.** MDN describes the User-Agent header as \"a characteristic string that lets servers and network peers identify\" the requesting application. OpenAI's training crawler, for example, sends a long string that includes `GPTBot/1.4; +https://openai.com/gptbot`.\n- **In robots.txt.** The `User-agent:` line names a short **product token**, such as `GPTBot`. RFC 9309 says crawlers \"MUST use case-insensitive matching\" to find the group for their token.\n\nUsually the token also appears in the header string. Google-Extended is the exception: Google says it \"doesn't have a separate HTTP request user agent string\", so you write rules for it but never see it in logs.\n\nA user-agent string is only a claim. Google says its crawlers identify themselves by the header, the source IP and the reverse DNS hostname, and OpenAI publishes IP lists for its bots. Verify before you trust a request that says it is a known AI crawler.",
  example: {
    label: "The token in robots.txt matches part of the header string",
    language: "robots",
    body: "# Header sent by the bot (from OpenAI's docs):\n# Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot\n\nUser-agent: GPTBot\nDisallow: /",
  },
  related: ["robots-txt", "gptbot", "oai-searchbot", "claudebot", "perplexitybot", "google-extended"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "User-Agent header",
      publisher: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent",
      date: "2025-10-28",
      dateKind: "updated",
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
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
      accessed: "2026-10-28",
    },
    {
      title: "Google's common crawlers",
      publisher: "Google Crawling Infrastructure",
      url: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers",
      date: "2026-10-15",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
    {
      title: "Overview of Google crawlers and fetchers (user agents)",
      publisher: "Google Crawling Infrastructure",
      url: "https://developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers",
      date: "2026-06-12",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
  ],
};
