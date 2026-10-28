import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "oai-searchbot",
  term: "OAI-SearchBot",
  definition:
    "OAI-SearchBot is OpenAI's crawler for ChatGPT's search features; sites that disallow it in robots.txt are not shown in ChatGPT search answers.",
  explanation:
    "If you want to be cited in ChatGPT search, OAI-SearchBot is the bot to let in. OpenAI says it \"is used to surface websites in search results in ChatGPT's search features\", and that \"Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers\", though they can still appear as navigational links.\n\nIt is separate from `GPTBot`, OpenAI's training crawler. OpenAI states that \"Each setting is independent of the others\", so you can allow OAI-SearchBot while disallowing GPTBot.\n\nIt is also separate from `ChatGPT-User`, the agent used for certain user actions in ChatGPT. OpenAI says \"ChatGPT-User is not used to determine whether content may appear in Search\" and points site owners to OAI-SearchBot for managing search opt-outs.\n\nChanges are not instant. OpenAI says \"it can take ~24 hours from a site's robots.txt update for our systems to adjust.\" Note the date of any change so you can compare it with your logs and citation tracking later. OpenAI also publishes the bot's IP addresses (`openai.com/searchbot.json`), so you can confirm that a request claiming to be OAI-SearchBot is genuine.",
  example: {
    label: "Allow ChatGPT search everywhere except checkout",
    language: "robots",
    body: "User-agent: OAI-SearchBot\nDisallow: /checkout/",
  },
  related: ["gptbot", "robots-txt", "user-agent", "perplexitybot", "citation"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "Overview of OpenAI Crawlers",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/bots",
      accessed: "2026-10-28",
    },
  ],
};
