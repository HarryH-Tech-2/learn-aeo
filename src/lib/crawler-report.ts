// The AI Crawler Checker's report: every crawler in src/lib/ai-crawlers.ts evaluated against a
// site's robots.txt (src/lib/robots-eval.ts), plus a snippet that unblocks the search and
// user-request crawlers. Training crawlers are listed separately: whether to allow those is a
// business decision the tool leaves to the marketer.

import { AI_CRAWLERS, type CrawlerPurpose } from "./ai-crawlers";
import { evaluateRobots, robotsFetchVerdict } from "./robots-eval";

export type CrawlerResult = {
  token: string;
  operator: string;
  purpose: CrawlerPurpose;
  what: string;
  docsUrl: string;
  allowed: boolean;
  /** The user-agent group that applied ("*", the token, or null when no group did). */
  group: string | null;
  /** The robots.txt line that decided it, e.g. "Disallow: /". */
  rule: string | null;
};

export type CrawlerReport = {
  host: string;
  robotsUrl: string;
  /** How the fetch status applies to the whole file (RFC 9309 §2.3.1). */
  verdict: "use-body" | "allow-all" | "disallow-all";
  status: number | null;
  crawlers: CrawlerResult[];
  /** robots.txt lines that let blocked search and user-request crawlers in, or "" if none are blocked. */
  fixes: string;
  /** Training crawlers the file blocks (left as they are; the marketer decides). */
  blockedTraining: string[];
};

export function buildCrawlerReport(input: {
  host: string;
  fetched: { status: number; text: string } | { error: string };
}): CrawlerReport {
  const status = "status" in input.fetched ? input.fetched.status : null;
  const verdict = status === null ? "disallow-all" : robotsFetchVerdict(status);
  const text = "text" in input.fetched ? input.fetched.text : "";

  const crawlers: CrawlerResult[] = AI_CRAWLERS.map((c) => {
    const base = { token: c.token, operator: c.operator, purpose: c.purpose, what: c.what, docsUrl: c.source.url };
    if (verdict === "use-body") return { ...base, ...evaluateRobots(text, c.token, "/") };
    return { ...base, allowed: verdict === "allow-all", group: null, rule: null };
  });

  const blocked = crawlers.filter((c) => !c.allowed);
  const fixes =
    verdict === "use-body"
      ? blocked
          .filter((c) => c.purpose === "search" || c.purpose === "user")
          .map((c) => `User-agent: ${c.token}\nAllow: /`)
          .join("\n\n")
      : "";

  return {
    host: input.host,
    robotsUrl: `https://${input.host}/robots.txt`,
    verdict,
    status,
    crawlers,
    fixes,
    blockedTraining: blocked.filter((c) => c.purpose === "training").map((c) => c.token),
  };
}
