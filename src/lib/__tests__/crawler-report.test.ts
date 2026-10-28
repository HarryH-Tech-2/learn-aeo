import { describe, it, expect } from "vitest";
import { buildCrawlerReport } from "@/lib/crawler-report";
import { AI_CRAWLERS } from "@/lib/ai-crawlers";

const ROBOTS = "User-agent: GPTBot\nUser-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n";

describe("buildCrawlerReport", () => {
  it("reports each catalog crawler against the file", () => {
    const r = buildCrawlerReport({ host: "example.com", fetched: { status: 200, text: ROBOTS } });
    expect(r.robotsUrl).toBe("https://example.com/robots.txt");
    expect(r.verdict).toBe("use-body");
    expect(r.crawlers).toHaveLength(AI_CRAWLERS.length);
    const by = Object.fromEntries(r.crawlers.map((c) => [c.token, c]));
    expect(by.GPTBot).toMatchObject({ allowed: false, group: "gptbot", rule: "Disallow: /" });
    expect(by["OAI-SearchBot"].allowed).toBe(false);
    expect(by.ClaudeBot).toMatchObject({ allowed: true, group: "*" });
  });

  it("suggests unblocking blocked search and user crawlers, never training ones", () => {
    const r = buildCrawlerReport({ host: "example.com", fetched: { status: 200, text: ROBOTS } });
    expect(r.fixes).toContain("User-agent: OAI-SearchBot\nAllow: /");
    expect(r.fixes).not.toContain("GPTBot");
    expect(r.blockedTraining).toEqual(["GPTBot"]);
  });

  it("has no fix when nothing that matters is blocked", () => {
    const r = buildCrawlerReport({ host: "example.com", fetched: { status: 200, text: "" } });
    expect(r.crawlers.every((c) => c.allowed)).toBe(true);
    expect(r.fixes).toBe("");
  });

  it("treats a 404 as allow-all and a 5xx or network error as disallow-all (RFC 9309)", () => {
    expect(buildCrawlerReport({ host: "a.com", fetched: { status: 404, text: "x" } }).crawlers.every((c) => c.allowed)).toBe(true);
    const down = buildCrawlerReport({ host: "a.com", fetched: { status: 503, text: "" } });
    expect(down.verdict).toBe("disallow-all");
    expect(down.crawlers.every((c) => !c.allowed)).toBe(true);
    expect(buildCrawlerReport({ host: "a.com", fetched: { error: "timeout" } }).verdict).toBe("disallow-all");
  });
});
