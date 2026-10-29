/**
 * Pure checks for scripts/smoke-prod.mjs and scripts/dev/check-seo.mjs. Each takes a fetched
 * response (or text) and returns a list of problems; an empty list means it passed.
 *
 * @typedef {{ status: number; headers: Record<string, string>; body?: string; location?: string }} Res
 */

/** Headers vercel.json sets on every page. */
export const SECURITY_HEADERS = ["x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"];

/** AI search crawlers robots.txt must name (src/app/robots.ts allows them explicitly). */
export const ROBOTS_MUST_NAME = ["OAI-SearchBot", "PerplexityBot", "ClaudeBot"];

/** @param {Res} r @param {string} siteUrl */
export function checkApexRedirect(r, siteUrl) {
  if ((r.status === 301 || r.status === 308) && (r.location ?? "").startsWith(`${siteUrl}/`)) return [];
  return [`apex: expected a 301/308 to ${siteUrl}/, got ${r.status}${r.location ? ` → ${r.location}` : ""}`];
}

/** @param {Res} r */
export function checkSecurityHeaders(r) {
  return SECURITY_HEADERS.filter((h) => !r.headers[h]).map((h) => `missing security header: ${h}`);
}

/** @param {Res} r */
export function checkIndexable(r) {
  return /noindex/i.test(r.headers["x-robots-tag"] ?? "") ? [`X-Robots-Tag: ${r.headers["x-robots-tag"]}`] : [];
}

/** @param {string} body @param {string} siteUrl */
export function checkRobotsTxt(body, siteUrl) {
  const problems = ROBOTS_MUST_NAME.filter((t) => !new RegExp(`^User-agent:\\s*${t}\\s*$`, "im").test(body)).map(
    (t) => `robots.txt does not name ${t}`
  );
  if (!body.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) problems.push(`robots.txt has no Sitemap: ${siteUrl}/sitemap.xml`);
  // The * group must not shut everyone out.
  const star = body.split(/\n\s*\n/).find((g) => /^User-agent:\s*\*\s*$/im.test(g)) ?? "";
  if (/^Disallow:\s*\/\s*$/im.test(star)) problems.push("robots.txt disallows everything for User-agent: *");
  return problems;
}

/** @param {Res} r */
export function checkLlmsTxt(r) {
  const problems = [];
  if (r.status !== 200) problems.push(`llms.txt status ${r.status}`);
  if (!(r.headers["content-type"] ?? "").startsWith("text/plain")) problems.push(`llms.txt content-type ${r.headers["content-type"]}`);
  if (r.status === 200 && !(r.body ?? "").startsWith("# Learn AEO")) problems.push("llms.txt does not start with # Learn AEO");
  return problems;
}

/** @param {Res} r */
export function checkUnsignedWebhook(r) {
  return r.status === 400 ? [] : [`unsigned webhook POST returned ${r.status}, expected 400`];
}

/** Twitter card tags and a 70-160 character meta description. @param {string} html @param {string} path */
export function checkHeadTags(html, path) {
  const problems = [];
  for (const name of ["twitter:card", "twitter:title", "twitter:image"]) {
    if (!new RegExp(`<meta name="${name}" content="[^"]+"`).test(html)) problems.push(`${path}: no ${name}`);
  }
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1];
  if (desc !== undefined) {
    const n = desc.replace(/&[a-z#0-9]+;/gi, "x").length;
    if (n < 70 || n > 160) problems.push(`${path}: meta description is ${n} characters (70-160)`);
  }
  return problems;
}
