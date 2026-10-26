import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PRODIGI_REFERENCE_PREFIX,
  assetUrl,
  createProdigiOrder,
  prodigiBaseUrl,
  prodigiConfigured,
  prodigiOrderBody,
  prodigiProductFor,
  shippedTracking,
  signAsset,
  verifyAssetSignature,
  type ProdigiOrderInput,
} from "@/lib/prodigi";

const input: ProdigiOrderInput = {
  sessionId: "cs_test_abc123",
  format: "framed",
  recipient: { name: "Harry H", email: "harry@example.com", line1: "1 Nile St", line2: null, city: "London", state: null, postcode: "N1 1AA", country: "GB" },
  assetUrl: "https://test.example.com/api/cartouche-print/asset?session_id=cs_test_abc123&sig=abc",
  callbackUrl: "https://test.example.com/api/prodigi/callback",
};

describe("prodigi", () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env.NEXTAUTH_URL = "https://test.example.com";
    process.env.NEXTAUTH_SECRET = "test-secret";
    delete process.env.PRODIGI_ASSET_SECRET;
    delete process.env.PRODIGI_API_KEY;
    delete process.env.PRODIGI_ENV;
    delete process.env.PRODIGI_SKU_PRINT;
    delete process.env.PRODIGI_SKU_FRAMED;
    delete process.env.PRODIGI_SKU_FRAMED_ATTRIBUTES;
  });
  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it("is off until a key is set, and points at the sandbox unless told otherwise", () => {
    expect(prodigiConfigured()).toBe(false);
    expect(prodigiBaseUrl()).toContain("sandbox");
    process.env.PRODIGI_API_KEY = "k";
    process.env.PRODIGI_ENV = "live";
    expect(prodigiConfigured()).toBe(true);
    expect(prodigiBaseUrl()).toBe("https://api.prodigi.com/v4.0");
  });

  it("signs the artwork URL and only accepts its own signature", () => {
    const sig = signAsset("cs_test_1");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyAssetSignature("cs_test_1", sig)).toBe(true);
    expect(verifyAssetSignature("cs_test_2", sig)).toBe(false);
    expect(verifyAssetSignature("cs_test_1", sig.replace(/^./, sig[0] === "0" ? "1" : "0"))).toBe(false);
    expect(verifyAssetSignature("cs_test_1", "nope")).toBe(false);
    expect(verifyAssetSignature("cs_test_1", null)).toBe(false);
    expect(assetUrl("cs_test_1")).toBe(`https://test.example.com/api/cartouche-print/asset?session_id=cs_test_1&sig=${sig}`);
  });

  it("a different secret gives a different signature", () => {
    const a = signAsset("cs_test_1");
    process.env.PRODIGI_ASSET_SECRET = "other";
    expect(signAsset("cs_test_1")).not.toBe(a);
  });

  it("picks the SKU per format, with env overrides", () => {
    expect(prodigiProductFor("print")).toEqual({ sku: "GLOBAL-FAP-A4" });
    expect(prodigiProductFor("framed")).toEqual({ sku: "GLOBAL-CFPM-A4", attributes: { color: "black" } });
    process.env.PRODIGI_SKU_PRINT = "X-1";
    process.env.PRODIGI_SKU_FRAMED = "X-2";
    process.env.PRODIGI_SKU_FRAMED_ATTRIBUTES = '{"color":"natural","glaze":"acrylic"}';
    expect(prodigiProductFor("print").sku).toBe("X-1");
    expect(prodigiProductFor("framed")).toEqual({ sku: "X-2", attributes: { color: "natural", glaze: "acrylic" } });
  });

  it("builds the order Prodigi expects: our reference, the address, one item fetching the signed artwork", () => {
    const body = prodigiOrderBody(input);
    expect(body.merchantReference).toBe(`${PRODIGI_REFERENCE_PREFIX}cs_test_abc123`);
    expect(body.shippingMethod).toBe("Standard");
    expect(body.callbackUrl).toBe(input.callbackUrl);
    expect(body.recipient).toEqual({
      name: "Harry H",
      email: "harry@example.com",
      address: { line1: "1 Nile St", postalOrZipCode: "N1 1AA", countryCode: "GB", townOrCity: "London" },
    });
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ sku: "GLOBAL-CFPM-A4", copies: 1, sizing: "fillPrintArea", attributes: { color: "black" } });
    expect(body.items[0].assets).toEqual([{ printArea: "default", url: input.assetUrl }]);
  });

  it("posts the order with the key and returns Prodigi's order", async () => {
    process.env.PRODIGI_API_KEY = "sandbox-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ outcome: "Created", order: { id: "ord_1", status: { stage: "InProgress" } } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const order = await createProdigiOrder({ ...input, idempotencyKey: "cs_test_abc123" });
    expect(order.id).toBe("ord_1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.sandbox.prodigi.com/v4.0/Orders");
    expect(init.method).toBe("POST");
    expect(init.headers["X-API-Key"]).toBe("sandbox-key");
    expect(init.headers["Idempotency-Key"]).toBe("cs_test_abc123");
    expect(JSON.parse(init.body).merchantReference).toBe(`${PRODIGI_REFERENCE_PREFIX}cs_test_abc123`);
  });

  it("throws Prodigi's message when the order is refused, and without a key", async () => {
    await expect(createProdigiOrder(input)).rejects.toThrow(/PRODIGI_API_KEY/);
    process.env.PRODIGI_API_KEY = "k";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ outcome: "ValidationFailed", issues: [{ description: "bad sku" }] }) }),
    );
    await expect(createProdigiOrder(input)).rejects.toThrow(/400 ValidationFailed.*bad sku/);
  });

  it("finds the first shipment with tracking", () => {
    expect(shippedTracking({ id: "o" })).toBeNull();
    expect(shippedTracking({ id: "o", shipments: [{ status: "Processing", tracking: null }] })).toBeNull();
    expect(
      shippedTracking({
        id: "o",
        shipments: [
          { status: "Processing", tracking: null },
          { carrier: { name: "Royal Mail" }, tracking: { number: "RM1", url: "https://track/RM1" } },
        ],
      }),
    ).toEqual({ carrier: "Royal Mail", url: "https://track/RM1", number: "RM1" });
  });
});
