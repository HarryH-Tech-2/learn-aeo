import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { blogPosts, getPostBySlug } from "@/lib/blog-posts";
import { countWords } from "@/app/blog/blog-text";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { GLOSSARY } from "@/lib/glossary";

const SLUGS = [
  "what-is-aeo",
  "aeo-vs-seo-vs-geo",
  "how-to-learn-aeo",
  "is-aeo-worth-learning",
  "best-aeo-courses",
  "how-chatgpt-chooses-sources",
  "get-cited-in-google-ai-overviews",
  "llms-txt-explained",
];

const sentences = (s: string) => s.split(/(?<=[.!?])\s+(?=[A-Z"(])/).filter(Boolean).length;

describe("launch blog posts", () => {
  it("has the 8 launch posts", () => {
    expect(blogPosts.map((p) => p.slug).sort()).toEqual([...SLUGS].sort());
    expect(getPostBySlug("what-is-aeo")?.title).toBe("What is answer engine optimization (AEO)?");
  });

  it.each(SLUGS)("%s: quick answer, FAQs, sources, length, links, art, date", (slug) => {
    const p = getPostBySlug(slug)!;
    expect(p).toBeDefined();
    expect(sentences(p.quickAnswer)).toBeGreaterThanOrEqual(1);
    expect(sentences(p.quickAnswer)).toBeLessThanOrEqual(3);
    expect(p.faqs.length).toBeGreaterThanOrEqual(3);
    expect(p.sources.length).toBeGreaterThanOrEqual(3);
    for (const s of p.sources) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const n = countWords(p.content);
    expect(n, `${slug} has ${n} words`).toBeGreaterThanOrEqual(900);
    expect(n, `${slug} has ${n} words`).toBeLessThanOrEqual(2000);
    for (const r of p.relatedSlugs) expect(SLUGS).toContain(r);
    expect(p.relatedSlugs).not.toContain(slug);
    expect(p.image).toBe(`/blog/${slug}.webp`);
    expect(existsSync(join(process.cwd(), "public", p.image)), `${p.image} exists`).toBe(true);
    expect(p.publishedAt).toBe("2026-10-28");
  });

  it("names no person as author", () => {
    for (const p of blogPosts) expect(JSON.stringify(p)).not.toMatch(/"@type":\s*"Person"|\bauthor\b:/i);
  });

  it("links internally only to pages that exist", () => {
    const ok = new Set([
      "/", "/pricing", "/blog", "/tools", "/tools/ai-crawler-checker", "/tools/llms-txt-generator", "/glossary",
      ...LESSON_CATALOG.map((l) => `/lessons/${l.id}`),
      ...GLOSSARY.map((t) => `/glossary/${t.slug}`),
      ...SLUGS.map((s) => `/blog/${s}`),
    ]);
    for (const p of blogPosts) {
      const text = [p.content, p.quickAnswer, ...p.faqs.map((f) => f.answer)].join("\n");
      for (const m of text.matchAll(/\]\((\/[^)\s#]*)/g)) expect(ok.has(m[1]), `${p.slug} links ${m[1]}`).toBe(true);
    }
  });

  it("best-aeo-courses discloses that Learn AEO is ours", () => {
    expect(getPostBySlug("best-aeo-courses")!.content).toMatch(/Learn AEO is (our|ours|run by us|the course we)/i);
  });
});
