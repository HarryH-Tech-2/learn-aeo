import { describe, it, expect } from "vitest";
import { GLOSSARY, getTerm } from "@/lib/glossary";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";

const words = (s: string) => s.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

describe("GLOSSARY", () => {
  it("has the 30 launch terms, unique slugs, sorted by term", () => {
    expect(GLOSSARY).toHaveLength(30);
    const slugs = GLOSSARY.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(30);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const terms = GLOSSARY.map((t) => t.term.toLowerCase());
    expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b)));
    expect(getTerm("query-fan-out")?.term).toBe("Query fan-out");
    expect(getTerm("nope")).toBeUndefined();
  });

  it.each(GLOSSARY.map((t) => [t.slug, t] as const))("%s: a one-sentence definition that starts with the term", (_slug, t) => {
    expect(words(t.definition)).toBeLessThanOrEqual(30);
    const def = norm(t.definition).replace(/^(a|an|the) /, "");
    const names = [t.term, ...(t.aka ?? [])].map(norm);
    expect(names.some((n) => def.startsWith(n) || def.startsWith(`${n}s `)), `${t.definition}`).toBe(true);
  });

  it.each(GLOSSARY.map((t) => [t.slug, t] as const))("%s: an 80-250 word explanation, valid links, sources", (_slug, t) => {
    const n = words(t.explanation);
    expect(n).toBeGreaterThanOrEqual(80);
    expect(n).toBeLessThanOrEqual(250);
    for (const r of t.related) expect(getTerm(r), `related ${r}`).toBeDefined();
    expect(t.related).not.toContain(t.slug);
    if (t.lesson) expect(LESSON_CATALOG.map((l) => l.id)).toContain(t.lesson);
    expect(t.sources.length).toBeGreaterThanOrEqual(1);
    for (const s of t.sources) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("links internally only to pages that exist", () => {
    const ok = new Set(["/pricing", "/tools", "/tools/ai-crawler-checker", "/tools/llms-txt-generator", ...LESSON_CATALOG.map((l) => `/lessons/${l.id}`), ...GLOSSARY.map((t) => `/glossary/${t.slug}`)]);
    for (const t of GLOSSARY) {
      for (const m of t.explanation.matchAll(/\]\((\/[^)\s#]*)/g)) expect(ok.has(m[1]), `${t.slug} links ${m[1]}`).toBe(true);
    }
  });
});
