import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";
import { createCheckoutSession, isCurrencyNotSupported } from "@/lib/stripe";

const noGbp = { type: "StripeInvalidRequestError", message: "The price `price_x` does not support the currency `gbp`." };
const params = { mode: "payment", line_items: [{ price: "price_x", quantity: 1 }] } as Stripe.Checkout.SessionCreateParams;

function stripeWith(create: ReturnType<typeof vi.fn>) {
  return { checkout: { sessions: { create } } } as unknown as Stripe;
}

describe("createCheckoutSession", () => {
  it("creates the session as given when no currency is asked for", async () => {
    const create = vi.fn().mockResolvedValue({ id: "cs_1" });
    await createCheckoutSession(stripeWith(create), params);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].currency).toBeUndefined();
  });

  it("asks Stripe for the currency first and never reads the Price", async () => {
    const create = vi.fn().mockResolvedValue({ id: "cs_1" });
    const session = await createCheckoutSession(stripeWith(create), params, "gbp");
    expect(session.id).toBe("cs_1");
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toMatchObject({ ...params, currency: "gbp" });
  });

  it("retries without the currency when the Price has no option in it", async () => {
    const create = vi.fn().mockRejectedValueOnce(noGbp).mockResolvedValue({ id: "cs_2" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const session = await createCheckoutSession(stripeWith(create), params, "gbp");
    expect(session.id).toBe("cs_2");
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1][0].currency).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("lets every other error through", async () => {
    const boom = { type: "StripePermissionError", message: "Permission denied." };
    const create = vi.fn().mockRejectedValue(boom);
    await expect(createCheckoutSession(stripeWith(create), params, "gbp")).rejects.toBe(boom);
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe("isCurrencyNotSupported", () => {
  it("matches only Stripe's invalid-request error about the currency", () => {
    expect(isCurrencyNotSupported(noGbp)).toBe(true);
    expect(isCurrencyNotSupported({ type: "StripeInvalidRequestError", message: "No such price: 'price_x'" })).toBe(false);
    expect(isCurrencyNotSupported({ type: "StripePermissionError", message: "currency" })).toBe(false);
    expect(isCurrencyNotSupported(null)).toBe(false);
    expect(isCurrencyNotSupported(new Error("currency"))).toBe(false);
  });
});
