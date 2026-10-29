import { describe, it, expect } from "vitest";
import {
  checkApexRedirect,
  checkHeadTags,
  checkIndexable,
  checkLlmsTxt,
  checkRobotsTxt,
  checkSecurityHeaders,
  checkUnsignedWebhook,
} from "../../../scripts/lib/smoke-checks.mjs";

const SITE = "https://www.learnaeo.com";
const res = (status: number, headers: Record<string, string> = {}, body = "", location?: string) => ({ status, headers, body, location });

const SECURITY = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

describe("smoke checks", () => {
  it("apex redirects permanently to www", () => {
    expect(checkApexRedirect(res(308, {}, "", `${SITE}/`), SITE)).toEqual([]);
    expect(checkApexRedirect(res(301, {}, "", `${SITE}/pricing`), SITE)).toEqual([]);
    expect(checkApexRedirect(res(200), SITE)).toHaveLength(1);
    expect(checkApexRedirect(res(302, {}, "", `${SITE}/`), SITE)).toHaveLength(1);
  });

  it("names each missing security header", () => {
    expect(checkSecurityHeaders(res(200, SECURITY))).toEqual([]);
    const { "x-frame-options": _drop, ...rest } = SECURITY;
    const p = checkSecurityHeaders(res(200, rest));
    expect(p).toHaveLength(1);
    expect(p[0]).toContain("x-frame-options");
  });

  it("refuses X-Robots-Tag noindex", () => {
    expect(checkIndexable(res(200))).toEqual([]);
    expect(checkIndexable(res(200, { "x-robots-tag": "noindex, nofollow" }))).toHaveLength(1);
  });

  it("checks robots.txt names the AI search crawlers, lists the sitemap and doesn't block everyone", () => {
    const good = `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: *\nDisallow: /account\n\nSitemap: ${SITE}/sitemap.xml\n`;
    expect(checkRobotsTxt(good, SITE)).toEqual([]);
    expect(checkRobotsTxt(good.replace("PerplexityBot", "Other"), SITE).join()).toContain("PerplexityBot");
    expect(checkRobotsTxt(good.replace(/Sitemap:.*/, ""), SITE).join()).toContain("Sitemap");
    expect(checkRobotsTxt(good.replace("Disallow: /account", "Disallow: /"), SITE)).toHaveLength(1);
  });

  it("checks llms.txt is plain text starting with the H1", () => {
    expect(checkLlmsTxt(res(200, { "content-type": "text/plain; charset=utf-8" }, "# Learn AEO\n\n> ..."))).toEqual([]);
    expect(checkLlmsTxt(res(200, { "content-type": "text/html" }, "# Learn AEO"))).toHaveLength(1);
    expect(checkLlmsTxt(res(404, { "content-type": "text/plain" }, ""))).not.toEqual([]);
  });

  it("expects an unsigned webhook POST to be rejected with 400", () => {
    expect(checkUnsignedWebhook(res(400))).toEqual([]);
    expect(checkUnsignedWebhook(res(200))).toHaveLength(1);
    expect(checkUnsignedWebhook(res(500))).toHaveLength(1);
  });

  it("checks Twitter tags and description length in a page head", () => {
    const desc = "d".repeat(100);
    const head = `<meta name="description" content="${desc}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="T"/><meta name="twitter:image" content="https://x/i.png"/>`;
    expect(checkHeadTags(head, "/")).toEqual([]);
    expect(checkHeadTags(head.replace(/<meta name="twitter:image"[^>]*>/, ""), "/").join()).toContain("twitter:image");
    expect(checkHeadTags(head.replace(desc, "short"), "/").join()).toMatch(/description.*5/);
    expect(checkHeadTags(head.replace(desc, "d".repeat(170)), "/").join()).toMatch(/description.*170/);
  });
});
