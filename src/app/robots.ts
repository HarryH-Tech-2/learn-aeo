import type { MetadataRoute } from "next";

// Pages that are personal or transactional — no value in any index.
const PRIVATE = ["/dashboard", "/account", "/certificate", "/checkout", "/cartouche-print", "/hieroglyphics-keyboard/hd", "/login", "/api/", "/play/"];

// AI assistants already send real visitors (ChatGPT, Copilot, Perplexity show up
// in GA4 as the "AI Assistant" channel). Listing their crawlers explicitly — with
// the same allow/disallow as everyone else — signals that the public content is
// meant to be read, summarised and cited. /llms.txt gives them a map.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: "https://www.learnhieroglyphics.com/sitemap.xml",
    host: "https://www.learnhieroglyphics.com",
  };
}
