import { describe, it, expect } from "vitest";
import { analyzeCitability, contentBlocks, decodeEntities, jsonLdFacts } from "@/lib/citability";

const para = (n: number, start = "Answer engines") => `<p>${start} ${Array.from({ length: n - 2 }, (_, i) => `word${i}`).join(" ")}</p>`;

const GOOD = `<!doctype html><html><head>
<title>How long does AEO take? | Example</title>
<meta name="description" content="How long answer engine optimization takes to show results.">
<meta name="author" content="Sam Lee">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Article","datePublished":"2026-10-01","author":{"@type":"Person","name":"Sam Lee"}},{"@type":"Organization"}]}</script>
</head><body>
<nav><p>Home Blog Pricing and some nav text that should be ignored entirely here</p></nav>
<main>
<h1>How long does AEO take?</h1>
<p>Most sites see their first AI citations within 4 to 12 weeks of fixing crawler access and rewriting key pages.</p>
<h2>What affects the timeline?</h2>
${para(60, "Crawl frequency")}
<ul><li>Crawler access</li><li>Indexing in 2026</li></ul>
<h2>How do you measure progress?</h2>
${para(70, "Search Console")}
<p>See <a href="https://developers.google.com/search">Google</a> and <a href="https://www.bing.com/webmasters">Bing</a> for 3 reports.</p>
${para(80, "Bing Webmaster Tools 2026")}
${para(60, "Prompt sets of 30")}
</main>
<footer><p>Footer text that should never count toward anything at all here</p></footer>
</body></html>`;

describe("helpers", () => {
  it("decodes named and numeric entities", () => {
    expect(decodeEntities("Q&amp;A &#39;x&#39; &#x2014; &rsquo;")).toBe("Q&A 'x' — ’");
  });

  it("collects JSON-LD types through @graph, with date and author", () => {
    const f = jsonLdFacts(GOOD);
    expect(f.types).toEqual(expect.arrayContaining(["Article", "Organization", "Person"]));
    expect(f.hasDate).toBe(true);
    expect(f.hasAuthor).toBe(true);
    expect(jsonLdFacts('<script type="application/ld+json">{not json</script>').types).toEqual([]);
  });

  it("keeps an H1 that sits in a <header> inside <main>", () => {
    const { blocks } = contentBlocks('<body><main><header><h1>Search engine optimization</h1></header><p>Body text here.</p></main></body>');
    expect(blocks[0]).toEqual({ tag: "h1", text: "Search engine optimization" });
  });

  it("reads only the main content, without nav, footer or scripts", () => {
    const { blocks } = contentBlocks(GOOD);
    const text = blocks.map((b) => b.text).join(" ");
    expect(text).not.toMatch(/nav text|Footer text/);
    expect(blocks[0]).toEqual({ tag: "h1", text: "How long does AEO take?" });
  });
});

describe("analyzeCitability", () => {
  it("passes a well-structured page", () => {
    const r = analyzeCitability(GOOD, "https://example.com/aeo-timeline");
    const byId = Object.fromEntries(r.checks.map((c) => [c.id, c.status]));
    expect(byId).toMatchObject({ fetch: "pass", h1: "pass", "answer-first": "pass", headings: "pass", paragraphs: "pass", structure: "pass", sources: "pass", dates: "pass", author: "pass", schema: "pass", meta: "pass" });
    expect(r.leadPassage).toMatch(/^Most sites see/);
    expect(r.title).toBe("How long does AEO take? | Example");
    expect(r.score).toBeGreaterThanOrEqual(85);
  });

  it("flags a buried answer, long walls of text and dangling openings", () => {
    const html = `<html><head><title>T</title></head><body><h1>Guide</h1>${para(140, "It")}${para(130, "This")}${para(125, "They")}</body></html>`;
    const r = analyzeCitability(html, "https://example.com/");
    const get = (id: string) => r.checks.find((c) => c.id === id)!;
    expect(get("answer-first").status).toBe("fail");
    expect(get("paragraphs").status).toBe("fail");
    expect(get("standalone").status).toBe("fail");
    expect(get("standalone").fix).toMatch(/“It”/);
    expect(get("headings").status).toBe("fail");
    expect(get("meta").status).toBe("warn");
    expect(r.score).toBeLessThanOrEqual(50);
  });

  it("fails a noindex page, an error status and a page with no text in its HTML", () => {
    const empty = `<html><head><meta name="robots" content="noindex"></head><body><div id="root"></div>${"<script></script>".repeat(12)}</body></html>`;
    const r = analyzeCitability(empty, "https://example.com/app");
    expect(r.checks.find((c) => c.id === "fetch")!.status).toBe("fail");
    expect(r.checks.find((c) => c.id === "text")!.detail).toMatch(/lot of scripts/);
    expect(analyzeCitability(GOOD, "https://example.com/", 404).checks[0].detail).toMatch(/404/);
  });

  it("does not count links to its own site as sources", () => {
    const html = GOOD.replace(/https:\/\/developers\.google\.com\/search|https:\/\/www\.bing\.com\/webmasters/g, "https://www.example.com/x");
    expect(analyzeCitability(html, "https://example.com/").checks.find((c) => c.id === "sources")!.status).toBe("warn");
  });
});
