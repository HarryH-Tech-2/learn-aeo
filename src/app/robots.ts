import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { AI_CRAWLERS } from "@/lib/ai-crawlers";

// Pages that are personal or transactional — no value in any index.
const PRIVATE = ["/dashboard", "/account", "/certificate", "/checkout", "/login", "/welcome", "/admin", "/api/"];

// Every AI crawler and token in src/lib/ai-crawlers.ts gets an explicit group with the same
// allow/disallow as everyone else: it signals that the public content is meant to be read,
// summarized and cited. /llms.txt gives them a map.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_CRAWLERS.map(({ token }) => ({ userAgent: token, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
