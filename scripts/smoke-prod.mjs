#!/usr/bin/env node
/**
 * Post-deploy smoke test of the live site (or a local build):
 *
 *   node scripts/smoke-prod.mjs                          # https://www.learnaeo.com
 *   node scripts/smoke-prod.mjs http://localhost:3100    # a local `next start`
 *
 * Checks the apex → www redirect and security headers (production only: both come from Vercel), no X-Robots-Tag noindex
 * on the home page, robots.txt, llms.txt, that an unsigned Stripe webhook POST is rejected, and that
 * the AI Crawler Checker answers; then runs scripts/dev/check-seo.mjs against the same base.
 * Read-only apart from one crawler check of example.com. Exits 1 on any problem.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CANONICAL_SITE_URL } from "./lib/env-check.mjs";
import {
  checkApexRedirect,
  checkIndexable,
  checkLlmsTxt,
  checkRobotsTxt,
  checkSecurityHeaders,
  checkUnsignedWebhook,
} from "./lib/smoke-checks.mjs";

const base = (process.argv[2] ?? CANONICAL_SITE_URL).replace(/\/+$/, "");
const problems = [];

async function get(url, init = {}) {
  const res = await fetch(url, { redirect: "manual", ...init });
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers),
    body: await res.text(),
    location: res.headers.get("location") ?? undefined,
  };
}

function report(name, found) {
  console.log(`${found.length ? "✗" : "✓"} ${name}`);
  problems.push(...found);
}

if (base === CANONICAL_SITE_URL) {
  report("apex redirects to www", checkApexRedirect(await get(CANONICAL_SITE_URL.replace("://www.", "://")), CANONICAL_SITE_URL));
} else {
  console.log(`- apex redirect skipped (base is ${base}, not ${CANONICAL_SITE_URL})`);
}

const home = await get(`${base}/`);
const onVercel = base === CANONICAL_SITE_URL;
report(`home page: 200, indexable${onVercel ? ", security headers" : ""}`, [
  ...(home.status === 200 ? [] : [`home status ${home.status}`]),
  // The security headers come from vercel.json, which `next start` doesn't read.
  ...(onVercel ? checkSecurityHeaders(home) : []),
  ...checkIndexable(home),
]);
if (!onVercel) console.log("- security headers skipped (set by vercel.json, so only checkable on Vercel)");
const robots = await get(`${base}/robots.txt`);
report("robots.txt", robots.status === 200 ? checkRobotsTxt(robots.body, CANONICAL_SITE_URL) : [`robots.txt status ${robots.status}`]);
report("llms.txt", checkLlmsTxt(await get(`${base}/llms.txt`)));
report(
  "unsigned Stripe webhook is rejected",
  checkUnsignedWebhook(await get(`${base}/api/webhooks/stripe`, { method: "POST", body: "{}", headers: { "content-type": "application/json" } }))
);
const crawler = await get(`${base}/api/tools/ai-crawler-check`, {
  method: "POST",
  body: JSON.stringify({ domain: "example.com" }),
  headers: { "content-type": "application/json" },
});
report("AI Crawler Checker answers", crawler.status === 200 ? [] : [`crawler check status ${crawler.status}`]);

console.log("\nSEO check of every sitemap URL:");
const seo = spawnSync(process.execPath, [fileURLToPath(new URL("./dev/check-seo.mjs", import.meta.url)), base], { stdio: "inherit" });

if (problems.length) console.error(`\n${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
process.exit(problems.length || seo.status ? 1 : 0);
