#!/usr/bin/env node
/**
 * Check the head of every page in the sitemap against a running build:
 *
 *   npm run build && npx next start -p 3200
 *   node scripts/dev/check-seo.mjs http://localhost:3200
 *
 * For each sitemap URL (fetched from baseUrl, with the production origin swapped for it):
 * status 200, one <title>, a meta description, a canonical and og:url equal to the sitemap
 * URL, an og:image, no noindex, every ld+json block parses, no Person, and the Organization
 * @id on the page, Twitter card tags, a 70-160 character description and no X-Robots-Tag noindex
 * (scripts/lib/smoke-checks.mjs). The Course @id must be the same on / and /pricing. Exits 1 on any failure.
 */
import { checkHeadTags, checkIndexable } from "../lib/smoke-checks.mjs";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const failures = [];
const fail = (where, what) => failures.push(`${where}: ${what}`);

async function get(path) {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  return { status: res.status, type: res.headers.get("content-type") ?? "", headers: Object.fromEntries(res.headers), text: await res.text() };
}

const attr = (html, re) => (html.match(re) ?? [])[1];

function ldBlocks(html, where) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const doc = JSON.parse(m[1]);
      out.push(...(doc["@graph"] ?? [doc]));
    } catch (e) {
      fail(where, `ld+json does not parse: ${e.message}`);
    }
  }
  return out;
}

const sitemap = await get("/sitemap.xml");
if (sitemap.status !== 200) fail("/sitemap.xml", `status ${sitemap.status}`);
const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) fail("/sitemap.xml", "no URLs");
const origin = urls.length ? new URL(urls[0]).origin : "";

for (const p of ["/robots.txt", "/llms.txt"]) {
  const r = await get(p);
  if (r.status !== 200 || !r.type.startsWith("text/plain")) fail(p, `status ${r.status} ${r.type}`);
}

const courseIds = {};
const rows = [];
for (const url of urls) {
  const path = url.slice(origin.length) || "/";
  const r = await get(path);
  const h = r.text;
  const where = path;
  const before = failures.length;
  if (r.status !== 200) fail(where, `status ${r.status}`);
  const titles = h.match(/<title>[^<]*<\/title>/g) ?? [];
  if (titles.length !== 1) fail(where, `${titles.length} <title> tags`);
  if (!attr(h, /<meta name="description" content="([^"]+)"/)) fail(where, "no meta description");
  const canonical = attr(h, /<link rel="canonical" href="([^"]+)"/);
  if (canonical !== url) fail(where, `canonical ${canonical} != ${url}`);
  const ogUrl = attr(h, /<meta property="og:url" content="([^"]+)"/);
  if (ogUrl !== url) fail(where, `og:url ${ogUrl} != ${url}`);
  const ogImage = attr(h, /<meta property="og:image" content="([^"]+)"/);
  if (!ogImage) fail(where, "no og:image");
  else {
    const img = await fetch(`${base}${ogImage.replace(origin, "")}`, { redirect: "manual" });
    if (img.status !== 200 || !(img.headers.get("content-type") ?? "").startsWith("image/")) fail(where, `og:image ${ogImage} → ${img.status}`);
  }
  if (/<meta name="robots" content="[^"]*noindex/.test(h)) fail(where, "noindex on a sitemap URL");
  for (const p of [...checkIndexable(r), ...checkHeadTags(h, path)]) fail(where, p);
  const nodes = ldBlocks(h, where);
  if (nodes.some((n) => n["@type"] === "Person") || /"@type":"Person"/.test(h)) fail(where, "a Person in JSON-LD");
  if (!nodes.some((n) => n["@type"] === "Organization" && n["@id"] === `${origin}/#organization`)) fail(where, "no Organization @id");
  const course = nodes.find((n) => n["@type"] === "Course");
  if (course) courseIds[path] = course["@id"];
  rows.push(`${failures.length === before ? "ok  " : "FAIL"} ${r.status} ${path}  [${nodes.map((n) => n["@type"]).join(", ")}]`);
}

for (const p of ["/", "/pricing"]) if (!courseIds[p]) fail(p, "no Course in JSON-LD");
if (courseIds["/"] && courseIds["/"] !== courseIds["/pricing"]) fail("/pricing", `Course @id ${courseIds["/pricing"]} != ${courseIds["/"]}`);

console.log(rows.join("\n"));
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.map((f) => `  - ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`\nAll ${urls.length} sitemap URLs pass.`);
