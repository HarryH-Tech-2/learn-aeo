import { describe, it, expect } from "vitest";
import { clientKey, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows the limit, then refuses with a retry time, then recovers after the window", () => {
    const key = `k-${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };
    for (let i = 0; i < 3; i++) expect(rateLimit(key, { ...opts, now: 1000 + i }).ok).toBe(true);
    const refused = rateLimit(key, { ...opts, now: 2000 });
    expect(refused.ok).toBe(false);
    expect(refused.retryAfterSec).toBeGreaterThan(0);
    expect(refused.retryAfterSec).toBeLessThanOrEqual(60);
    expect(rateLimit(key, { ...opts, now: 1000 + 60_001 }).ok).toBe(true);
  });

  it("keeps keys apart", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, { limit: 1, windowMs: 1000, now: 0 }).ok).toBe(true);
    expect(rateLimit(a, { limit: 1, windowMs: 1000, now: 1 }).ok).toBe(false);
    expect(rateLimit(b, { limit: 1, windowMs: 1000, now: 1 }).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first x-forwarded-for hop, then x-real-ip", () => {
    expect(clientKey(new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" } }))).toBe("203.0.113.5");
    expect(clientKey(new Request("http://x", { headers: { "x-real-ip": "198.51.100.2" } }))).toBe("198.51.100.2");
    expect(clientKey(new Request("http://x"))).toBe("unknown");
  });
});
