import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const stripe = {
  coupons: { retrieve: vi.fn(), create: vi.fn() },
  prices: { retrieve: vi.fn() },
  promotionCodes: { create: vi.fn() },
};

vi.mock("@/lib/stripe", () => ({ getStripe: () => stripe }));
vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn(async () => ({ active: false })) }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async () => ({ id: "u1", offerCode: null, offerExpiresAt: null, offerSource: null })),
      update: vi.fn(async () => ({})),
    },
  },
}));

import { grantOffer, OFFER_COUPON_ID } from "@/lib/offers";

describe("grantOffer coupon creation", () => {
  const savedPrice = process.env.STRIPE_PRICE_ID;

  beforeEach(() => {
    vi.clearAllMocks();
    stripe.coupons.retrieve.mockRejectedValue(new Error("No such coupon"));
    stripe.prices.retrieve.mockResolvedValue({ id: "price_life", product: "prod_life" });
  });
  afterEach(() => {
    if (savedPrice === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = savedPrice;
  });

  it("creates a missing coupon limited to the Lifetime product", async () => {
    process.env.STRIPE_PRICE_ID = "price_life";
    await grantOffer("a@b.co", "lesson-complete");
    expect(stripe.prices.retrieve).toHaveBeenCalledWith("price_life");
    expect(stripe.coupons.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: OFFER_COUPON_ID, applies_to: { products: ["prod_life"] } }),
    );
  });

  it("never creates an unrestricted coupon when the Lifetime price is unknown", async () => {
    delete process.env.STRIPE_PRICE_ID;
    await expect(grantOffer("a@b.co", "lesson-complete")).rejects.toThrow(/STRIPE_PRICE_ID/);
    expect(stripe.coupons.create).not.toHaveBeenCalled();
    expect(stripe.promotionCodes.create).not.toHaveBeenCalled();
  });

  it("leaves an existing coupon alone", async () => {
    stripe.coupons.retrieve.mockResolvedValue({ id: OFFER_COUPON_ID });
    process.env.STRIPE_PRICE_ID = "price_life";
    await grantOffer("a@b.co", "lesson-complete");
    expect(stripe.coupons.create).not.toHaveBeenCalled();
  });
});
