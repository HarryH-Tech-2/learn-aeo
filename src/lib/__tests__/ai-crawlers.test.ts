import { describe, it, expect } from "vitest";
import { AI_CRAWLERS } from "@/lib/ai-crawlers";
import robots from "@/app/robots";

describe("AI_CRAWLERS", () => {
  it("has unique tokens and the main operators' crawlers", () => {
    const tokens = AI_CRAWLERS.map((c) => c.token);
    expect(new Set(tokens.map((t) => t.toLowerCase())).size).toBe(tokens.length);
    for (const t of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent"]) {
      expect(tokens).toContain(t);
    }
  });

  it("sources every entry from the operator's own page", () => {
    for (const c of AI_CRAWLERS) {
      expect(c.source.url).toMatch(/^https:\/\//);
      expect(c.source.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.what.length).toBeGreaterThan(20);
      expect(["training", "search", "user", "other"]).toContain(c.purpose);
    }
  });

  it("classifies the well-documented ones as their operators do", () => {
    const p = Object.fromEntries(AI_CRAWLERS.map((c) => [c.token, c.purpose]));
    expect(p).toMatchObject({ GPTBot: "training", "OAI-SearchBot": "search", "ChatGPT-User": "user", ClaudeBot: "training", "Claude-SearchBot": "search", "Claude-User": "user", PerplexityBot: "search", "Perplexity-User": "user", "Google-Extended": "training" });
  });

  it("is what robots.txt lists", () => {
    const r = robots();
    const agents = (Array.isArray(r.rules) ? r.rules : [r.rules]).flatMap((x) => (Array.isArray(x.userAgent) ? x.userAgent : [x.userAgent]));
    for (const c of AI_CRAWLERS) expect(agents).toContain(c.token);
  });
});
