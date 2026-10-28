import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "claudebot",
  term: "ClaudeBot",
  definition:
    "ClaudeBot is Anthropic's crawler that collects web content for training its generative AI models; blocking it in robots.txt excludes your future content from that training.",
  explanation:
    "ClaudeBot is Anthropic's **training** crawler. Anthropic says that when a site restricts it, this \"signals that the site's future materials should be excluded\" from its AI model training datasets. Note the word *future*: the opt-out is described as applying going forward.\n\nAnthropic runs two other bots with different jobs. `Claude-SearchBot` navigates the web to improve search results, and blocking it may reduce your visibility in user search results. `Claude-User` fetches pages when users ask Claude questions. Each has its own robots.txt token, so you can block training while staying available to search.\n\nThree practical points from Anthropic's page:\n\n- It supports the non-standard `Crawl-delay` extension if you want to slow ClaudeBot down rather than block it.\n- Rules apply per host: \"Please do this for every subdomain that you wish to opt out from.\"\n- Blocking Anthropic's IP addresses instead of using robots.txt \"may not work correctly\" as an opt-out.",
  example: {
    label: "Block Anthropic training, keep Claude search",
    language: "robots",
    body: "User-agent: ClaudeBot\nDisallow: /\n\nUser-agent: Claude-SearchBot\nAllow: /",
  },
  related: ["gptbot", "robots-txt", "user-agent", "perplexitybot", "google-extended"],
  lesson: "make-your-site-reachable-by-ai",
  sources: [
    {
      title: "Does Anthropic crawl data from the web, and how can site owners block the crawler?",
      publisher: "Claude Help Center",
      url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
      date: "2026-04-07",
      dateKind: "updated",
      accessed: "2026-10-28",
    },
  ],
};
