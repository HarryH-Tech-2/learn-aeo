import { NextResponse } from "next/server";
import { safeFetchText } from "@/lib/safe-fetch";
import { normalizePageUrl } from "@/lib/page-url";
import { analyzeCitability } from "@/lib/citability";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/tools/citability-check { url } → CitabilityReport
 * Fetches the page once (SSRF-guarded, src/lib/safe-fetch.ts; 1 MB cap) and scores the HTML as served against the
 * course's citability checklist (src/lib/citability.ts). 400 for input that isn't a public web page; 422 when it
 * resolves to a private address or isn't HTML; 429 past 10 checks per visitor per 10 minutes; 502 when the page
 * can't be reached. Never returns the fetched body, only the report.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`citability-check:${clientKey(request)}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many checks. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const target = normalizePageUrl(typeof body?.url === "string" ? body.url : "");
  if (!target.ok) return NextResponse.json({ error: target.error }, { status: 400 });

  const res = await safeFetchText(target.url, { maxBytes: 1024 * 1024, timeoutMs: 10_000 });
  if (!res.ok && res.error === "blocked") {
    return NextResponse.json({ error: "That address points to a private or reserved network, so it can't be checked." }, { status: 422 });
  }
  if (!res.ok) {
    const why =
      res.error === "timeout"
        ? "The page took too long to answer."
        : res.error === "too-many-redirects"
          ? "The page redirected too many times."
          : "The page couldn't be reached. Check the address.";
    return NextResponse.json({ error: why }, { status: 502 });
  }
  if (!/<(html|body|p|h1|main|article)\b/i.test(res.text)) {
    return NextResponse.json({ error: "That address didn't return an HTML page, so there was nothing to check." }, { status: 422 });
  }
  const report = analyzeCitability(res.text, res.finalUrl, res.status);
  return NextResponse.json({ ...report, truncated: res.truncated });
}
