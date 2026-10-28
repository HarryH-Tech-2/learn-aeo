import { describe, it, expect } from "vitest";
import { evaluateRobots, parseRobots, robotsFetchVerdict } from "@/lib/robots-eval";

describe("parseRobots", () => {
  it("groups consecutive user-agent lines and ignores comments, BOM, CRLF and unknown lines", () => {
    const g = parseRobots("﻿# hi\r\nUser-agent: GPTBot\r\nUser-Agent: ClaudeBot # both\r\nDisallow: /private\r\nSitemap: https://x.test/s.xml\r\nCrawl-delay: 5\r\n\r\nUser-agent: *\r\nAllow: /\r\n");
    expect(g).toHaveLength(2);
    expect(g[0].agents).toEqual(["gptbot", "claudebot"]);
    expect(g[0].rules).toEqual([{ allow: false, path: "/private" }]);
    expect(g[1].agents).toEqual(["*"]);
  });
});

describe("evaluateRobots (RFC 9309)", () => {
  it("allows everything for an empty file", () => {
    expect(evaluateRobots("", "GPTBot").allowed).toBe(true);
  });

  it("uses a crawler's own group over *, case-insensitively", () => {
    const txt = "User-agent: *\nDisallow: /\n\nUser-agent: gptbot\nAllow: /\n";
    expect(evaluateRobots(txt, "GPTBot")).toMatchObject({ allowed: true, group: "gptbot" });
    expect(evaluateRobots(txt, "ClaudeBot")).toMatchObject({ allowed: false, group: "*", rule: "Disallow: /" });
  });

  it("blocks a crawler named in a shared group", () => {
    const txt = "User-agent: GPTBot\nUser-agent: CCBot\nDisallow: /\n";
    expect(evaluateRobots(txt, "CCBot").allowed).toBe(false);
    expect(evaluateRobots(txt, "PerplexityBot")).toMatchObject({ allowed: true, group: null });
  });

  it("merges several groups for the same agent", () => {
    const txt = "User-agent: GPTBot\nDisallow: /a\n\nUser-agent: GPTBot\nDisallow: /\n";
    expect(evaluateRobots(txt, "GPTBot", "/b").allowed).toBe(false);
  });

  it("takes the longest match, and Allow wins a tie", () => {
    const txt = "User-agent: *\nDisallow: /docs\nAllow: /docs/public\nAllow: /x\nDisallow: /x\n";
    expect(evaluateRobots(txt, "Bot", "/docs/public/a").allowed).toBe(true);
    expect(evaluateRobots(txt, "Bot", "/docs/private").allowed).toBe(false);
    expect(evaluateRobots(txt, "Bot", "/x").allowed).toBe(true);
  });

  it("supports * and $ wildcards", () => {
    const txt = "User-agent: *\nDisallow: /\nAllow: /$\nDisallow: /*.pdf$\n";
    expect(evaluateRobots(txt, "Bot", "/").allowed).toBe(true);
    expect(evaluateRobots(txt, "Bot", "/page").allowed).toBe(false);
    const t2 = "User-agent: *\nDisallow: /*.pdf$\n";
    expect(evaluateRobots(t2, "Bot", "/a/b.pdf").allowed).toBe(false);
    expect(evaluateRobots(t2, "Bot", "/a/b.pdfx").allowed).toBe(true);
  });

  it("treats an empty Disallow as allow-all", () => {
    expect(evaluateRobots("User-agent: *\nDisallow:\n", "Bot").allowed).toBe(true);
  });

  it("matches the product token, not a substring of another agent's name", () => {
    expect(evaluateRobots("User-agent: Claude\nDisallow: /\n", "ClaudeBot").allowed).toBe(true);
  });
});

describe("robotsFetchVerdict (RFC 9309 §2.3.1)", () => {
  it("uses the body on 2xx, allows on 4xx (incl. 401/403), disallows on 5xx", () => {
    expect(robotsFetchVerdict(200)).toBe("use-body");
    for (const s of [400, 401, 403, 404, 410]) expect(robotsFetchVerdict(s)).toBe("allow-all");
    for (const s of [500, 503]) expect(robotsFetchVerdict(s)).toBe("disallow-all");
  });
});
