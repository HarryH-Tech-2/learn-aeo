import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.hoisted(() => vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test_print", id: "cs_test_print" }));

vi.mock("next-auth", () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
// Keep the real createCheckoutSession: only the client is faked.
vi.mock("@/lib/stripe", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/stripe")>()),
  getStripe: vi.fn().mockReturnValue({
    checkout: { sessions: { create: mockCreate } },
  }),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/cartouche-print/checkout/route";

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(new NextRequest("http://localhost/api/cartouche-print/checkout", { method: "POST", body: JSON.stringify(body), headers }));
}

describe("POST /api/cartouche-print/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.STRIPE_PRICE_CARTOUCHE;
    delete process.env.STRIPE_PRICE_CARTOUCHE_PRINT;
    delete process.env.STRIPE_PRICE_CARTOUCHE_FRAMED;
    delete process.env.STRIPE_PRICE_CARTOUCHE_IMAGE;
    process.env.NEXTAUTH_URL = "https://test.example.com";
  });

  it("rejects an empty or unwritable name", async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ name: "   " })).status).toBe(400);
    expect((await post({ name: "<b>x</b>" })).status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("starts a one-off payment for the name, in USD by default, with an inline price when no Price is configured", async () => {
    const res = await post({ name: "Harry", format: "digital" });
    expect(res.status).toBe(200);
    expect((await res.json()).url).toContain("checkout.stripe.com");
    const params = mockCreate.mock.calls[0][0];
    expect(params.mode).toBe("payment");
    expect(params.metadata).toMatchObject({ product: "cartouche-print", name: "Harry" });
    expect(params.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: 1999 });
    expect(params.success_url).toBe("https://test.example.com/cartouche-print?session_id={CHECKOUT_SESSION_ID}");
    expect(params.cancel_url).toBe("https://test.example.com/translate-name-to-hieroglyphics/Harry?print=cancelled");
    expect(params.customer_email).toBeUndefined();
  });

  it("sells the HD image at $3.99 / £2.99 with an inline price and no shipping address", async () => {
    await post({ name: "Harry", theme: "papyrus", format: "image" });
    const params = mockCreate.mock.calls[0][0];
    expect(params.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: 399 });
    expect(params.line_items[0].price_data.product_data.name).toBe("Cartouche Print · HD digital image");
    expect(params.metadata).toMatchObject({ product: "cartouche-print", name: "Harry", theme: "papyrus", format: "image" });
    expect(params.shipping_address_collection).toBeUndefined();

    await post({ name: "Harry", format: "image" }, { cookie: "lh_cc=GB" });
    expect(mockCreate.mock.calls[1][0].line_items[0].price_data).toMatchObject({ currency: "gbp", unit_amount: 299 });
  });

  it("charges in GBP for a UK visitor", async () => {
    await post({ name: "Harry", format: "digital" }, { cookie: "lh_cc=GB" });
    expect(mockCreate.mock.calls[0][0].line_items[0].price_data).toMatchObject({ currency: "gbp", unit_amount: 1599 });
  });

  it("uses the configured Price and asks for GBP for a UK visitor, without reading the Price", async () => {
    process.env.STRIPE_PRICE_CARTOUCHE = "price_print";
    await post({ name: "Harry", format: "digital" }, { cookie: "lh_cc=GB" });
    const params = mockCreate.mock.calls[0][0];
    expect(params.line_items[0]).toEqual({ price: "price_print", quantity: 1 });
    expect(params.currency).toBe("gbp");

    await post({ name: "Harry", format: "digital" });
    expect(mockCreate.mock.calls[1][0].currency).toBeUndefined();
  });

  it("falls back to the Price's own currency when Stripe says it has no GBP option", async () => {
    process.env.STRIPE_PRICE_CARTOUCHE = "price_print";
    mockCreate.mockRejectedValueOnce({ type: "StripeInvalidRequestError", message: "The price `price_print` does not support the currency `gbp`." });
    const res = await post({ name: "Harry", format: "digital" }, { cookie: "lh_cc=GB" });
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate.mock.calls[0][0].currency).toBe("gbp");
    expect(mockCreate.mock.calls[1][0].currency).toBeUndefined();
  });

  it("stores the chosen paper in the session metadata, and prints on cream when the choice is missing or unknown", async () => {
    await post({ name: "Harry", theme: "night", format: "digital" });
    expect(mockCreate.mock.calls[0][0].metadata.theme).toBe("night");
    expect(mockCreate.mock.calls[0][0].payment_intent_data.description).toBe("Cartouche Print · Digital PDF (Night): Harry");

    await post({ name: "Harry", format: "digital" });
    expect(mockCreate.mock.calls[1][0].metadata.theme).toBe("cream");

    const res = await post({ name: "Harry", theme: "neon", format: "digital" });
    expect(res.status).toBe(200);
    expect(mockCreate.mock.calls[2][0].metadata.theme).toBe("cream");
  });

  it("a posted print collects a shipping address in the countries the price covers, and uses its own Price", async () => {
    process.env.STRIPE_PRICE_CARTOUCHE_PRINT = "price_a4";
    process.env.STRIPE_PRICE_CARTOUCHE_FRAMED = "price_framed";
    await post({ name: "Harry", format: "print" });
    let params = mockCreate.mock.calls[0][0];
    expect(params.line_items[0]).toEqual({ price: "price_a4", quantity: 1 });
    expect(params.metadata.format).toBe("print");
    expect(params.shipping_address_collection.allowed_countries).toContain("GB");
    expect(params.shipping_address_collection.allowed_countries).toContain("US");

    await post({ name: "Harry", format: "framed" });
    params = mockCreate.mock.calls[1][0];
    expect(params.line_items[0]).toEqual({ price: "price_framed", quantity: 1 });
    expect(params.metadata.format).toBe("framed");
    expect(params.payment_intent_data.description).toBe("Cartouche Print · Framed A4 print (Cream): Harry");

    await post({ name: "Harry", format: "digital" });
    expect(mockCreate.mock.calls[2][0].shipping_address_collection).toBeUndefined();
  });

  it("a missing or unknown format sells the default, a posted print, at its inline price when no Price is set", async () => {
    await post({ name: "Harry" });
    let params = mockCreate.mock.calls[0][0];
    expect(params.metadata.format).toBe("print");
    expect(params.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: 3999 });
    expect(params.line_items[0].price_data.product_data.name).toBe("Cartouche Print · A4 print, posted");
    expect(params.shipping_address_collection).toBeDefined();

    await post({ name: "Harry", format: "hologram" }, { cookie: "lh_cc=GB" });
    params = mockCreate.mock.calls[1][0];
    expect(params.metadata.format).toBe("print");
    expect(params.line_items[0].price_data).toMatchObject({ currency: "gbp", unit_amount: 2799 });
  });

  it("keeps the GA4 client id so the webhook can attribute the sale", async () => {
    await post({ name: "Harry", format: "digital" }, { cookie: "_ga=GA1.1.123456789.1700000000" });
    expect(mockCreate.mock.calls[0][0].metadata.ga_client_id).toBe("123456789.1700000000");
  });
});

describe("POST /api/cartouche-print/checkout, family prints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.STRIPE_PRICE_CARTOUCHE;
    delete process.env.STRIPE_PRICE_CARTOUCHE_PRINT;
    delete process.env.STRIPE_PRICE_CARTOUCHE_FRAMED;
    delete process.env.STRIPE_PRICE_CARTOUCHE_IMAGE;
    process.env.NEXTAUTH_URL = "https://test.example.com";
  });

  it("a one-name order sends exactly the metadata it always did (no names key)", async () => {
    await post({ name: "Harry", names: ["Harry"], format: "print" });
    const params = mockCreate.mock.calls[0][0];
    expect(params.metadata.names).toBeUndefined();
    expect(params.metadata.name).toBe("Harry");
    expect(params.line_items[0].price_data.unit_amount).toBe(3999);
  });

  it("carries every name in metadata, first name in name, and charges $5 more for a posted family print", async () => {
    process.env.STRIPE_PRICE_CARTOUCHE_PRINT = "price_a4";
    await post({ name: "Harry", names: ["Harry", "Sally", "Tom"], format: "print", theme: "night" });
    const params = mockCreate.mock.calls[0][0];
    expect(params.metadata).toMatchObject({ product: "cartouche-print", name: "Harry", names: "Harry|Sally|Tom", format: "print" });
    // the family price is one inline line item, never the catalogue Price plus a mismatched extra
    expect(params.line_items).toHaveLength(1);
    expect(params.line_items[0].price).toBeUndefined();
    expect(params.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: 4499 });
    expect(params.line_items[0].price_data.product_data.name).toBe("Cartouche Print · A4 print, posted · family print, 3 names");
    expect(params.currency).toBeUndefined();
    expect(params.shipping_address_collection).toBeDefined();
    expect(params.payment_intent_data.description).toBe("Cartouche Print · A4 print, posted (Night): Harry, Sally and Tom");
  });

  it("charges £4 more for a framed family print in pounds", async () => {
    await post({ name: "Harry", names: ["Harry", "Sally"], format: "framed" }, { cookie: "lh_cc=GB" });
    expect(mockCreate.mock.calls[0][0].line_items[0].price_data).toMatchObject({ currency: "gbp", unit_amount: 6399 });
  });

  it("keeps the HD image at its own price, and its catalogue Price, with any number of names", async () => {
    await post({ name: "Harry", names: ["Harry", "Sally", "Tom", "Ann"], format: "image" });
    let params = mockCreate.mock.calls[0][0];
    expect(params.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: 399 });
    expect(params.metadata.names).toBe("Harry|Sally|Tom|Ann");

    process.env.STRIPE_PRICE_CARTOUCHE_IMAGE = "price_img";
    await post({ name: "Harry", names: ["Harry", "Sally"], format: "image" });
    params = mockCreate.mock.calls[1][0];
    expect(params.line_items[0]).toEqual({ price: "price_img", quantity: 1 });
  });

  it("drops repeats and blanks, and refuses a name that cannot be written or more than four", async () => {
    await post({ name: "Harry", names: ["Harry", "harry", "  ", "Sally"], format: "image" });
    expect(mockCreate.mock.calls[0][0].metadata.names).toBe("Harry|Sally");

    const bad = await post({ name: "Harry", names: ["Harry", "<b>x</b>"], format: "print" });
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toMatch(/cannot be written/);

    const many = await post({ name: "Harry", names: ["Harry", "Sally", "Tom", "Ann", "Zed"], format: "print" });
    expect(many.status).toBe(400);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});
