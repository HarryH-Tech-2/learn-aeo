import { describe, it, expect } from "vitest";
import { buildLlmsTxt } from "@/lib/llms-txt";
import { LESSON_CATALOG, lessonPath } from "@/lib/lesson-catalog";
import { TOOLS, toolPath } from "@/lib/tools";
import { absoluteUrl } from "@/lib/site";

const base = { lessons: LESSON_CATALOG, tools: TOOLS, posts: [], glossary: [] as { slug: string; term: string; definition: string }[] };

describe("buildLlmsTxt", () => {
  const txt = buildLlmsTxt(base);
  const lines = txt.split("\n");

  it("opens with the H1 and a blockquote summary (llmstxt.org)", () => {
    expect(lines[0]).toBe("# Learn AEO");
    expect(lines[2]).toMatch(/^> \S/);
  });

  it("links every live lesson and no coming-soon lesson", () => {
    for (const l of LESSON_CATALOG) {
      const link = `](${absoluteUrl(lessonPath(l.id))})`;
      if (l.status === "live") expect(txt).toContain(link);
      else {
        expect(txt).not.toContain(link);
        expect(lines.find((x) => x.includes(l.title))).toMatch(/coming soon/i);
      }
    }
  });

  it("has no tools section while every tool is coming soon, and links a live one", () => {
    const allSoon = TOOLS.map((t) => ({ ...t, status: "coming-soon" as const }));
    expect(buildLlmsTxt({ ...base, tools: allSoon })).not.toContain("## Free tools");
    const withLive = buildLlmsTxt({ ...base, tools: TOOLS.map((t, i) => ({ ...t, status: i === 0 ? ("live" as const) : ("coming-soon" as const) })) });
    expect(withLive).toContain("## Free tools");
    expect(withLive).toContain(`[${TOOLS[0].name}](${absoluteUrl(toolPath(TOOLS[0].slug))})`);
    expect(withLive).not.toContain(absoluteUrl(toolPath(TOOLS[1].slug)));
    expect(withLive).toContain(`[All free tools](${absoluteUrl("/tools")})`);
  });

  it("lists articles only when there are posts", () => {
    expect(txt).not.toContain("## Articles");
    const withPost = buildLlmsTxt({ ...base, posts: [{ slug: "what-is-aeo", title: "What is AEO?", excerpt: "A plain answer." }] });
    expect(withPost).toContain("## Articles");
    expect(withPost).toContain(`- [What is AEO?](${absoluteUrl("/blog/what-is-aeo")}): A plain answer.`);
  });

  it("lists glossary terms only when there are some", () => {
    expect(buildLlmsTxt(base)).not.toContain("## Glossary");
    const g = buildLlmsTxt({ ...base, glossary: [{ slug: "query-fan-out", term: "Query fan-out", definition: "Query fan-out is a technique." }] });
    expect(g).toContain("## Glossary");
    expect(g).toContain(`- [Query fan-out](${absoluteUrl("/glossary/query-fan-out")}): Query fan-out is a technique.`);
  });

  it("keeps the sitemap under Optional", () => {
    const opt = txt.indexOf("## Optional");
    expect(opt).toBeGreaterThan(0);
    expect(txt.slice(opt)).toContain(absoluteUrl("/sitemap.xml"));
  });
});
