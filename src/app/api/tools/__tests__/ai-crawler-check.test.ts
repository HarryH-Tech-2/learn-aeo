import { describe, it, expect, vi, beforeEach } from "vitest";

const safeFetchText = vi.hoisted(() => vi.fn());
vi.mock("@/lib/safe-fetch", async (orig) => ({ ...(await orig<typeof import("@/lib/safe-fetch")>()), safeFetchText }));

import { POST } from "@/app/api/tools/ai-crawler-check/route";

let ip = 0;
const post = (body: unknown, from = `198.51.100.${++ip % 250}`) =>
  POST(new Request("http://localhost/api/tools/ai-crawler-check", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": from }, body: JSON.stringify(body) }));

describe("POST /api/tools/ai-crawler-check", () => {
  beforeEach(() => {
    safeFetchText.mockReset();
    safeFetchText.mockResolvedValue({ ok: true, status: 200, finalUrl: "https://example.com/robots.txt", text: "User-agent: GPTBot\nDisallow: /\n", truncated: false });
  });

  it("returns the report for a public domain", async () => {
    const res = await post({ domain: "https://Example.com/page" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.host).toBe("example.com");
    expect(safeFetchText).toHaveBeenCalledWith("https://example.com/robots.txt");
    expect(body.crawlers.find((c: { token: string }) => c.token === "GPTBot").allowed).toBe(false);
  });

  it("400s on input that is not a domain, without fetching", async () => {
    for (const domain of ["", "localhost", "127.0.0.1", "ftp://x.com", 42]) {
      expect((await post({ domain })).status).toBe(400);
    }
    expect(safeFetchText).not.toHaveBeenCalled();
  });

  it("422s when the domain resolves somewhere private", async () => {
    safeFetchText.mockResolvedValue({ ok: false, error: "blocked" });
    expect((await post({ domain: "internal.example.com" })).status).toBe(422);
  });

  it("502s with an explanation, but no crawler table, when the site can't be reached (a typo shouldn't read as 'everything blocked')", async () => {
    for (const error of ["timeout", "network"]) {
      safeFetchText.mockResolvedValue({ ok: false, error });
      const res = await post({ domain: "slow.example.com" });
      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toMatch(/reach|long/i);
      expect(body.crawlers).toBeUndefined();
    }
  });

  it("allows 10 checks per visitor per 10 minutes", async () => {
    const me = "203.0.113.77";
    for (let i = 0; i < 10; i++) expect((await post({ domain: "example.com" }, me)).status).toBe(200);
    const limited = await post({ domain: "example.com" }, me);
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
  });
});
