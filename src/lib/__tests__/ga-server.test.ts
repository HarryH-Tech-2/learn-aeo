import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// SITE.gaId reads NEXT_PUBLIC_GA_ID when the module loads, so set it before the import is evaluated
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_GA_ID = "G-TESTAEO123";
});

import { gaClientIdFromCookie, gaSessionIdFromCookie, sendPurchaseToGA4, GA_MEASUREMENT_ID, GA_SESSION_COOKIE } from "@/lib/ga-server";

describe("gaClientIdFromCookie", () => {
  it("strips the GA1.1 prefix", () => {
    expect(gaClientIdFromCookie("GA1.1.123456789.1700000000")).toBe("123456789.1700000000");
  });
  it("is empty for missing or malformed cookies", () => {
    expect(gaClientIdFromCookie(undefined)).toBe("");
    expect(gaClientIdFromCookie("")).toBe("");
    expect(gaClientIdFromCookie("GA1.1")).toBe("");
  });
});

describe("gaSessionIdFromCookie", () => {
  it("reads the session id from both cookie formats", () => {
    expect(GA_SESSION_COOKIE).toBe("_ga_TESTAEO123");
    expect(gaSessionIdFromCookie("GS1.1.1700000000.3.1.1700000100.0.0.0")).toBe("1700000000");
    expect(gaSessionIdFromCookie("GS2.1.s1700000000$o3$g1$t1700000100$j60$l0$h0")).toBe("1700000000");
  });
  it("is empty for missing or malformed cookies", () => {
    expect(gaSessionIdFromCookie(undefined)).toBe("");
    expect(gaSessionIdFromCookie("nonsense")).toBe("");
  });
});

describe("sendPurchaseToGA4", () => {
  const purchase = { clientId: "1.2", transactionId: "cs_live_x", value: 100, currency: "usd", plan: "lifetime", planName: "Lifetime" };
  const original = process.env.GA4_MP_API_SECRET;
  beforeEach(() => {
    delete process.env.GA4_MP_API_SECRET;
  });
  afterEach(() => {
    if (original === undefined) delete process.env.GA4_MP_API_SECRET;
    else process.env.GA4_MP_API_SECRET = original;
  });

  it("does nothing without an API secret", async () => {
    const f = vi.fn();
    expect(await sendPurchaseToGA4(purchase, f as any)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("posts a purchase event with the transaction id, value and currency", async () => {
    process.env.GA4_MP_API_SECRET = "s3cret";
    const f = vi.fn().mockResolvedValue({ ok: true });
    expect(await sendPurchaseToGA4(purchase, f as any)).toBe(true);
    const [url, init] = f.mock.calls[0];
    expect(url).toContain(`measurement_id=${GA_MEASUREMENT_ID}`);
    expect(url).toContain("api_secret=s3cret");
    const body = JSON.parse(init.body);
    expect(body.client_id).toBe("1.2");
    expect(body.events[0].name).toBe("purchase");
    expect(body.events[0].params).toMatchObject({ transaction_id: "cs_live_x", value: 100, currency: "USD" });
    expect(body.events[0].params.items[0]).toMatchObject({ item_id: "lifetime", price: 100, quantity: 1 });
    expect(body.events[0].params.engagement_time_msec).toBe(1);
    expect(body.events[0].params.session_id).toBeUndefined();
    await sendPurchaseToGA4({ ...purchase, sessionId: "1700000000" }, f as any);
    expect(JSON.parse(f.mock.calls[1][1].body).events[0].params.session_id).toBe("1700000000");
  });

  it("invents a client id when the cookie was missing, and survives a network error", async () => {
    process.env.GA4_MP_API_SECRET = "s3cret";
    const f = vi.fn().mockResolvedValue({ ok: true });
    await sendPurchaseToGA4({ ...purchase, clientId: null }, f as any);
    expect(JSON.parse(f.mock.calls[0][1].body).client_id).toMatch(/^\d+\.\d+$/);
    const boom = vi.fn().mockRejectedValue(new Error("offline"));
    expect(await sendPurchaseToGA4(purchase, boom as any)).toBe(false);
  });
});
