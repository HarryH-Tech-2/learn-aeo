import { describe, it, expect, vi, beforeEach } from "vitest";

const safeFetchText = vi.hoisted(() => vi.fn());
vi.mock("@/lib/safe-fetch", async (orig) => ({ ...(await orig<typeof import("@/lib/safe-fetch")>()), safeFetchText }));

import { POST } from "@/app/api/tools/citability-check/route";
import { normalizePageUrl } from "@/lib/page-url";

let ip = 0;
const post = (body: unknown, from = `203.0.113.${++ip % 250}`) =>
  POST(new Request("http://localhost/api/tools/citability-check", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": from }, body: JSON.stringify(body) }));

const PAGE = "<html><head><title>T</title></head><body><main><h1>What is AEO?</h1><p>AEO is the practice of getting your pages cited in AI answers today.</p></main></body></html>";

describe("normalizePageUrl", () => {
  it("adds https, keeps the path and query, lowercases the host", () => {
    expect(normalizePageUrl("Example.com/blog/post?x=1")).toEqual({ ok: true, url: "https://example.com/blog/post?x=1" });
    expect(normalizePageUrl("http://example.com/")).toEqual({ ok: true, url: "http://example.com/" });
  });
  it("refuses empty input, other schemes, localhost and IP literals", () => {
    for (const u of ["", "ftp://example.com/x", "localhost/page", "http://127.0.0.1/", "javascript:alert(1)"]) {
      expect(normalizePageUrl(u).ok, u).toBe(false);
    }
  });
});

describe("POST /api/tools/citability-check", () => {
  beforeEach(() => {
    safeFetchText.mockReset();
    safeFetchText.mockResolvedValue({ ok: true, status: 200, finalUrl: "https://example.com/aeo", text: PAGE, truncated: false });
  });

  it("returns a report for a public page, fetched once with the full path", async () => {
    const res = await post({ url: "example.com/aeo" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(safeFetchText).toHaveBeenCalledTimes(1);
    expect(safeFetchText.mock.calls[0][0]).toBe("https://example.com/aeo");
    expect(body.url).toBe("https://example.com/aeo");
    expect(body.checks.length).toBeGreaterThan(10);
    expect(body).not.toHaveProperty("text");
  });

  it("400s on bad input without fetching", async () => {
    for (const url of ["", "localhost", 42]) expect((await post({ url })).status).toBe(400);
    expect(safeFetchText).not.toHaveBeenCalled();
  });

  it("422s on private addresses and on non-HTML responses", async () => {
    safeFetchText.mockResolvedValueOnce({ ok: false, error: "blocked" });
    expect((await post({ url: "internal.example.com" })).status).toBe(422);
    safeFetchText.mockResolvedValueOnce({ ok: true, status: 200, finalUrl: "https://example.com/a.json", text: '{"a":1}', truncated: false });
    expect((await post({ url: "example.com/a.json" })).status).toBe(422);
  });

  it("502s when the page can't be reached", async () => {
    safeFetchText.mockResolvedValue({ ok: false, error: "timeout" });
    const res = await post({ url: "example.com" });
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/too long/);
  });

  it("rate-limits one visitor after 10 checks", async () => {
    const from = "192.0.2.77";
    for (let i = 0; i < 10; i++) expect((await post({ url: "example.com" }, from)).status).toBe(200);
    expect((await post({ url: "example.com" }, from)).status).toBe(429);
  });
});
