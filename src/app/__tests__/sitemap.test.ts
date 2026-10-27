import { describe, it, expect } from "vitest";
import sitemap, { buildSitemap } from "@/app/sitemap";
import { SITE } from "@/lib/site";

describe("sitemap blog entries", () => {
  it("with the real (empty) post list has no /blog URLs and does not crash", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.filter((u) => u.includes("/blog"))).toEqual([]);
  });

  it("with posts lists /blog dated by the newest post, plus each post", () => {
    const entries = buildSitemap([
      { slug: "older-post", publishedAt: "2026-11-01" },
      { slug: "newer-post", publishedAt: "2026-11-05", updatedAt: "2026-12-02" },
    ]);
    const byUrl = new Map(entries.map((e) => [e.url, e]));
    expect(byUrl.get(`${SITE.url}/blog`)?.lastModified).toEqual(new Date("2026-12-02"));
    expect(byUrl.get(`${SITE.url}/blog/older-post`)?.lastModified).toEqual(new Date("2026-11-01"));
    expect(byUrl.get(`${SITE.url}/blog/newer-post`)?.lastModified).toEqual(new Date("2026-12-02"));
  });
});
