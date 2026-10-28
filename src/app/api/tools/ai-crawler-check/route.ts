import { NextResponse } from "next/server";
import { normalizeTarget, safeFetchText } from "@/lib/safe-fetch";
import { buildCrawlerReport } from "@/lib/crawler-report";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/tools/ai-crawler-check { domain } → CrawlerReport
 * Fetches https://<domain>/robots.txt once (SSRF-guarded: src/lib/safe-fetch.ts) and evaluates
 * every AI crawler against it. 400 for input that isn't a public domain; 422 when it resolves to
 * a private address; 429 past 10 checks per visitor per 10 minutes; 502 when the site can't be
 * reached (the report still says what RFC 9309 makes of that). Never returns the fetched body.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`crawler-check:${clientKey(request)}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many checks. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const body = (await request.json().catch(() => null)) as { domain?: unknown } | null;
  const target = normalizeTarget(typeof body?.domain === "string" ? body.domain : "");
  if (!target.ok) return NextResponse.json({ error: target.error }, { status: 400 });

  const res = await safeFetchText(`https://${target.host}/robots.txt`);
  if (!res.ok && res.error === "blocked") {
    return NextResponse.json({ error: "That domain points to a private or reserved address, so it can't be checked." }, { status: 422 });
  }
  if (!res.ok) {
    // No table: an unreachable host is far more often a typo or a down site than a policy, and a
    // column of "Blocked" would read as one. (RFC 9309 would have crawlers treat it as disallow-all.)
    const why = res.error === "timeout" ? "The site took too long to answer." : "The site couldn't be reached. Check the spelling of the domain.";
    return NextResponse.json(
      { host: target.host, error: `${why} While a site's robots.txt can't be read, the robots.txt standard tells crawlers to treat the whole site as off limits.` },
      { status: 502 }
    );
  }
  const report = buildCrawlerReport({ host: target.host, fetched: { status: res.status, text: res.text } });
  return NextResponse.json({ ...report, truncated: res.truncated });
}
