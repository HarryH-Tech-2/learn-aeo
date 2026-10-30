import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import { absoluteUrl } from "@/lib/site";

describe("robots.txt", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
  const agents = rules.flatMap((x) => (Array.isArray(x.userAgent) ? x.userAgent : [x.userAgent]));

  it("allows everyone but keeps the private paths out", () => {
    for (const rule of rules) {
      expect(rule.allow).toBe("/");
      for (const p of ["/dashboard", "/account", "/certificate", "/checkout", "/login", "/api/"]) expect(rule.disallow).toContain(p);
    }
  });

  it("names the main AI crawlers explicitly", () => {
    for (const a of ["*", "GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) expect(agents).toContain(a);
  });

  it("points at the sitemap", () => {
    expect(r.sitemap).toBe(absoluteUrl("/sitemap.xml"));
  });
});

describe("robots.txt (SEO audit 2026-10-30)", () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];

  it("keeps the welcome redirect and admin pages out of every group", () => {
    for (const rule of rules) {
      expect(rule.disallow).toContain("/welcome");
      expect(rule.disallow).toContain("/admin");
    }
  });

  it("drops the Host directive, which Google ignores and Yandex deprecated", () => {
    expect(r.host).toBeUndefined();
  });
});
