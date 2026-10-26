#!/usr/bin/env node
/**
 * Ping IndexNow (Bing, Yandex, Naver, Seznam…) with every URL in the live
 * sitemap, or with the URLs passed on the command line.
 *
 *   node scripts/indexnow-ping.mjs                 # everything in sitemap.xml
 *   node scripts/indexnow-ping.mjs /blog/new-post  # just these paths/URLs
 *
 * Run it after a deploy that adds or substantively changes pages. The key
 * lives in scripts/indexnow.config.json and is served from public/<key>.txt
 * (IndexNow verifies ownership by fetching that file).
 *
 * Copilot answers and ~30 % of this site's organic search come from the Bing
 * index, so this is worth the ten seconds.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const { key, host } = JSON.parse(readFileSync(path.join(here, "indexnow.config.json"), "utf8"));
const base = `https://${host}`;

async function sitemapUrls() {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = args.length
  ? args.map((u) => (u.startsWith("http") ? u : `${base}${u.startsWith("/") ? "" : "/"}${u}`))
  : await sitemapUrls();

if (!urlList.length) {
  console.error("No URLs to submit.");
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${base}/${key}.txt`, urlList }),
});

console.log(`IndexNow: ${res.status} ${res.statusText} — submitted ${urlList.length} URL(s)`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
