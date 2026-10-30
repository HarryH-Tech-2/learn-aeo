// Glossary page titles read as natural questions and fit in a results page (SEO audit 2026-10-30).
import { describe, it, expect } from "vitest";
import { GLOSSARY, glossaryTitle } from "@/lib/glossary";

const FULL = (t: string) => `${t} | Learn AEO`;

describe("glossary titles", () => {
  it("fit in 60 characters with the site name", () => {
    for (const t of GLOSSARY) expect(FULL(glossaryTitle(t)).length, t.slug).toBeLessThanOrEqual(60);
  });

  it("never capitalize a common noun mid-question ('What is Answer engine?')", () => {
    for (const t of GLOSSARY) expect(glossaryTitle(t), t.slug).not.toMatch(/^What (is|are) (a |an |the )?[A-Z][a-z]+ [a-z]/);
  });

  it("use natural grammar for the terms that need it", () => {
    const by = Object.fromEntries(GLOSSARY.map((t) => [t.slug, glossaryTitle(t)]));
    expect(by["ai-overviews"]).toMatch(/^What are AI Overviews\?/);
    expect(by["answer-engine"]).toMatch(/^What is an answer engine\?/);
    expect(by["user-agent"]).toMatch(/^What is a user agent\?/);
    expect(by["gptbot"]).toMatch(/^What is GPTBot\?/);
  });

  it("give the AEO and llms.txt terms a definition angle, leaving 'What is…' to the blog guides", () => {
    const by = Object.fromEntries(GLOSSARY.map((t) => [t.slug, glossaryTitle(t)]));
    expect(by["aeo"]).not.toMatch(/^What is/);
    expect(by["llms-txt"]).not.toMatch(/^What is/);
  });
});

describe("glossary terms link to their full blog guide", () => {
  it("points the terms that overlap a post at it, and only at real posts", async () => {
    const { getPostBySlug } = await import("@/lib/blog-posts");
    const by = Object.fromEntries(GLOSSARY.map((t) => [t.slug, t]));
    expect(by["aeo"].guide).toBe("what-is-aeo");
    expect(by["llms-txt"].guide).toBe("llms-txt-explained");
    expect(by["geo"].guide).toBe("aeo-vs-seo-vs-geo");
    expect(by["ai-overviews"].guide).toBe("get-cited-in-google-ai-overviews");
    for (const t of GLOSSARY) if (t.guide) expect(getPostBySlug(t.guide), t.slug).toBeDefined();
  });
});
