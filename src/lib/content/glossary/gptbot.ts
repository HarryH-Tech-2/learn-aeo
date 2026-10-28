import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "gptbot",
  term: "GPTBot",
  definition:
    "GPTBot is OpenAI's web crawler for model training: disallowing it in robots.txt tells OpenAI your content should not be used to train its generative AI foundation models.",
  explanation:
    "GPTBot is the switch for **training**, not for ChatGPT search. OpenAI says: \"Disallowing GPTBot indicates a site's content should not be used in training generative AI foundation models.\"\n\nOpenAI runs separate bots for separate jobs, and \"Each setting is independent of the others.\" Appearing in ChatGPT's search answers is controlled by `OAI-SearchBot`, so a common setup is to disallow GPTBot and allow OAI-SearchBot. OpenAI gives that combination as an example.\n\nIn your logs, GPTBot identifies itself with a user-agent string that includes `GPTBot/1.4; +https://openai.com/gptbot`. A user-agent string is only a claim, so check suspicious traffic against the IP ranges OpenAI publishes for the bot before you trust it.\n\nFor a marketer, the decision is a content-licensing one rather than a visibility one. Blocking GPTBot does not, on OpenAI's own description, remove you from ChatGPT search; blocking OAI-SearchBot does.",
  example: {
    label: "Opt out of OpenAI training, stay in ChatGPT search",
    language: "robots",
    body: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nAllow: /",
  },
  related: ["oai-searchbot", "robots-txt", "user-agent", "claudebot", "google-extended"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
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
