// The free AEO tools catalog: slugs, names and one-line summaries, like LESSON_CATALOG for
// lessons. A tool shows as "coming soon" (no link) until its page exists and its status is live.
// Edge-safe: no imports.

export type ToolMeta = {
  slug: string;
  name: string;
  summary: string;
  /** "server" tools fetch the user's site (SSRF-guarded, rate-limited); "client" tools run in the browser. */
  kind: "server" | "client";
  status: "live" | "coming-soon";
};

export const TOOLS: readonly ToolMeta[] = [
  {
    slug: "ai-crawler-checker",
    name: "AI Crawler Checker",
    summary: "Enter a domain to see which AI crawlers and AI user agents its robots.txt allows or blocks, with the lines to fix it.",
    kind: "server",
    status: "live",
  },
  {
    slug: "llms-txt-generator",
    name: "llms.txt Generator",
    summary: "Fill in a short form to build a valid llms.txt file you can copy or download.",
    kind: "client",
    status: "live",
  },
  {
    slug: "schema-generator",
    name: "Schema Generator",
    summary: "Build Organization, Article, FAQPage, HowTo or Product JSON-LD, with hints that catch common mistakes.",
    kind: "client",
    status: "coming-soon",
  },
  {
    slug: "citability-checker",
    name: "Citability Checker",
    summary: "Enter a URL to see how easily an answer engine can lift and cite its passages, with specific fixes.",
    kind: "server",
    status: "coming-soon",
  },
];

export function toolPath(slug: string): string {
  return `/tools/${slug}`;
}
