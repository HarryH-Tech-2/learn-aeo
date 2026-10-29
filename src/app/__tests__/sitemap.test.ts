import { describe, it, expect } from "vitest";
import sitemap, { buildSitemap } from "@/app/sitemap";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";
import { GLOSSARY } from "@/lib/glossary";
import { blogPosts } from "@/lib/blog-posts";

describe("sitemap blog entries", () => {
  it("with the real post list has /blog plus one URL per post", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.filter((u) => u.includes("/blog"))).toHaveLength(blogPosts.length + 1);
  });

  it("with posts lists /blog dated by the newest post, plus each post", () => {
    const entries = buildSitemap({
      posts: [
        { slug: "older-post", publishedAt: "2026-11-01" },
        { slug: "newer-post", publishedAt: "2026-11-05", updatedAt: "2026-12-02" },
      ],
      tools: [],
      glossary: [],
    });
    const byUrl = new Map(entries.map((e) => [e.url, e]));
    expect(byUrl.get(`${SITE.url}/blog`)?.lastModified).toEqual(new Date("2026-12-02"));
    expect(byUrl.get(`${SITE.url}/blog/older-post`)?.lastModified).toEqual(new Date("2026-11-01"));
    expect(byUrl.get(`${SITE.url}/blog/newer-post`)?.lastModified).toEqual(new Date("2026-12-02"));
  });
});

describe("sitemap tools and dates", () => {
  it("lists live tools only", () => {
    const tools = TOOLS.map((t, i) => ({ ...t, status: i === 0 ? ("live" as const) : ("coming-soon" as const) }));
    const urls = buildSitemap({ posts: [], tools, glossary: [] }).map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/tools/${TOOLS[0].slug}`);
    for (const t of TOOLS.slice(1)) expect(urls).not.toContain(`${SITE.url}/tools/${t.slug}`);
    const real = sitemap().map((e) => e.url);
    for (const t of TOOLS) expect(real.includes(`${SITE.url}/tools/${t.slug}`)).toBe(t.status === "live");
  });

  it("lists the /tools hub only while a tool is live", () => {
    const soon = TOOLS.map((t) => ({ ...t, status: "coming-soon" as const }));
    expect(buildSitemap({ posts: [], tools: soon, glossary: [] }).map((e) => e.url)).not.toContain(`${SITE.url}/tools`);
    const live = TOOLS.map((t, i) => ({ ...t, status: i === 0 ? ("live" as const) : ("coming-soon" as const) }));
    expect(buildSitemap({ posts: [], tools: live, glossary: [] }).map((e) => e.url)).toContain(`${SITE.url}/tools`);
  });

  it("lists the glossary index and every term", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/glossary`);
    for (const t of GLOSSARY) expect(urls).toContain(`${SITE.url}/glossary/${t.slug}`);
    expect(buildSitemap({ posts: [], tools: [], glossary: [] }).map((e) => e.url)).not.toContain(`${SITE.url}/glossary`);
  });

  it("has no private pages and no date before the site existed", () => {
    for (const e of sitemap()) {
      expect(e.url).not.toMatch(/\/(dashboard|account|certificate|checkout|login|admin|verify)/);
      expect(new Date(e.lastModified as Date).getTime()).toBeGreaterThanOrEqual(new Date("2026-10-26").getTime());
    }
  });
});
