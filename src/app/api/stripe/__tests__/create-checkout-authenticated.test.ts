import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    url: "https://checkout.stripe.com/pay/cs_test_123",
    id: "cs_test_123",
  })
);

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Keep the real createCheckoutSession: only the client is faked.
vi.mock("@/lib/stripe", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/stripe")>()),
  getStripe: vi.fn().mockReturnValue({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  }),
}));

vi.mock("@/lib/offers", () => ({
  getActiveOffer: vi.fn().mockResolvedValue(null),
  promotionCodeIdFor: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn().mockResolvedValue({ active: false, trial: false, via: null, periodEnd: null, license: null }),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/stripe/create-checkout/route";
import { getServerSession } from "next-auth";
import { checkSubscription } from "@/lib/subscription";

const mockedGetServerSession = vi.mocked(getServerSession);
const mockedCheckSubscription = vi.mocked(checkSubscription);
const noAccess = { active: false, trial: false, via: null, periodEnd: null, license: null } as const;

describe("POST /api/stripe/create-checkout (authenticated)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCheckSubscription.mockResolvedValue(noAccess);
    process.env.STRIPE_PRICE_ID = "price_test123";
    process.env.NEXTAUTH_URL = "https://test.example.com";
  });

  it("sends a Lifetime holder to the dashboard instead of Stripe", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "paid@example.com" } } as any);
    mockedCheckSubscription.mockResolvedValue({ ...noAccess, active: true, via: "lifetime" } as any);
    const req = new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", body: JSON.stringify({ plan: "lifetime" }) });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({ url: "/dashboard?already=active", alreadyActive: true });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("a Lifetime holder cannot buy the monthly plan either", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "paid@example.com" } } as any);
    mockedCheckSubscription.mockResolvedValue({ ...noAccess, active: true, via: "lifetime" } as any);
    process.env.STRIPE_PRICE_MONTHLY = "price_month";
    const monthly = await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", body: JSON.stringify({ plan: "monthly" }) }));
    expect((await monthly.json()).alreadyActive).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects any plan this site does not sell (old classroom/school ids, junk) with a 400", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "t@example.com" } } as any);
    process.env.STRIPE_PRICE_MONTHLY = "price_month";
    for (const plan of ["classroom", "school", "gold", "", 42, null]) {
      const res = await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", body: JSON.stringify({ plan }) }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/plan/i);
    }
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("a monthly subscriber may still upgrade to Lifetime", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "monthly@example.com" } } as any);
    mockedCheckSubscription.mockResolvedValue({ ...noAccess, active: true, via: "monthly" } as any);
    const res = await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", body: JSON.stringify({ plan: "lifetime" }) }));
    expect((await res.json()).url).toContain("checkout.stripe.com");
  });

  it("stores the GA4 client id from the _ga cookie in the session metadata", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "ga@example.com" } } as any);
    const req = new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", body: JSON.stringify({ plan: "lifetime" }), headers: { cookie: "_ga=GA1.1.123456789.1700000000" } });
    await POST(req);
    expect(mockCreate.mock.calls[0][0].metadata.ga_client_id).toBe("123456789.1700000000");
  });

  it("creates a checkout session with user email for signed-in users", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "learner@example.com" },
    });

    const response = await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/pay/cs_test_123");
    expect(mockCreate).toHaveBeenCalledOnce();

    const args = mockCreate.mock.calls[0][0];
    expect(args.mode).toBe("payment");
    expect(args.customer_email).toBe("learner@example.com");
    expect(args.line_items[0].price).toBe("price_test123");
    expect(args.line_items[0].quantity).toBe(1);
    expect(args.success_url).toContain("/dashboard?checkout=success");
    expect(args.cancel_url).toContain("/pricing?checkout=canceled");
    expect(args.customer_creation).toBe("always");
    expect(args.invoice_creation).toEqual({ enabled: true });
    expect(args.custom_text.submit.message).toContain("14 days for a full refund");
  });

  it("builds return links without a double slash when NEXTAUTH_URL ends in /", async () => {
    process.env.NEXTAUTH_URL = "https://test.example.com/";
    mockedGetServerSession.mockResolvedValue({ user: { email: "learner@example.com" } } as any);

    await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST" }));

    const args = mockCreate.mock.calls[0][0];
    expect(args.success_url).toMatch(/^https:\/\/test\.example\.com\/dashboard\?/);
    expect(args.cancel_url).toBe("https://test.example.com/pricing?checkout=canceled");
  });

  it("returns 500 when Stripe throws an error", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { email: "learner@example.com" },
    });
    mockCreate.mockRejectedValueOnce(new Error("Stripe API down"));

    const response = await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST" }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create checkout session.");
  });

  it("returns 401 when session has no email", async () => {
    mockedGetServerSession.mockResolvedValue({ user: {} });

    const response = await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });
  it("the monthly plan uses mode=subscription and carries the plan in metadata", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "t@example.com", id: "user_1" } });
    process.env.STRIPE_PRICE_MONTHLY = "price_month";

    const response = await POST(
      new NextRequest("http://localhost/api/stripe/create-checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
      })
    );
    expect(response.status).toBe(200);
    const args = mockCreate.mock.calls[0][0];
    expect(args.mode).toBe("subscription");
    expect(args.line_items[0].price).toBe("price_month");
    expect(args.metadata.plan).toBe("monthly");
    expect(args.subscription_data.metadata.plan).toBe("monthly");
    expect(args.success_url).toContain("/dashboard?checkout=success&plan=monthly");
    expect(args.success_url).not.toContain("/teachers");
    expect(args.customer_creation).toBeUndefined();
  });

  it("returns 503 when a plan has no Stripe price configured", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "t@example.com" } });
    delete process.env.STRIPE_PRICE_MONTHLY;
    const response = await POST(
      new NextRequest("http://localhost/api/stripe/create-checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
      })
    );
    expect(response.status).toBe(503);
    expect(mockCreate).not.toHaveBeenCalled();
  });
  it("applies the parity coupon for a tier-D country and skips promo-code entry", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "in@example.com" } });
    const req = new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", headers: { cookie: "aeo_cc=IN" } });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const args = mockCreate.mock.calls[0][0];
    expect(args.discounts).toEqual([{ coupon: "AEO_PPP_D" }]);
    expect(args.allow_promotion_codes).toBeUndefined();
    expect(args.metadata.ppp_country).toBe("IN");
    expect(args.metadata.ppp_tier).toBe("D");
  });

  it("a full-price country gets no parity coupon", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "us@example.com" } });
    const req = new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", headers: { cookie: "aeo_cc=US" } });
    await POST(req);
    const args = mockCreate.mock.calls[0][0];
    expect(args.discounts).toBeUndefined();
    // no promotion-code box unless they arrived with a code (?promo)
    expect(args.allow_promotion_codes).toBeUndefined();
    expect(args.metadata.ppp_country).toBe("");
  });

  it("shows the promotion-code box only when asked for, and never alongside a discount", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "us@example.com" } });
    await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", headers: { cookie: "aeo_cc=US" }, body: JSON.stringify({ promo: true }) }));
    expect(mockCreate.mock.calls[0][0].allow_promotion_codes).toBe(true);
    await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", headers: { cookie: "aeo_cc=IN" }, body: JSON.stringify({ promo: true }) }));
    const args = mockCreate.mock.calls[1][0];
    expect(args.discounts).toEqual([{ coupon: "AEO_PPP_D" }]);
    expect(args.allow_promotion_codes).toBeUndefined();
  });

  it("sends Cancel back to the page the buyer came from", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "us@example.com" } });
    await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", body: JSON.stringify({ from: "/lessons/royal-hall?step=3&checkout=canceled" }) }));
    expect(mockCreate.mock.calls[0][0].cancel_url).toBe("https://test.example.com/lessons/royal-hall?step=3&checkout=canceled");
    await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST", body: JSON.stringify({ from: "//evil.example.com/x" }) }));
    expect(mockCreate.mock.calls[1][0].cancel_url).toBe("https://test.example.com/pricing?checkout=canceled");
  });
});
