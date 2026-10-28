import { describe, it, expect, vi, beforeEach } from "vitest";

const mockConstructEvent = vi.hoisted(() => vi.fn());
const mockCustomersRetrieve = vi.hoisted(() => vi.fn());
const mockSubscriptionsRetrieve = vi.hoisted(() => vi.fn());
const mockActivate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockDeactivate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockSyncMonthly = vi.hoisted(() => vi.fn().mockResolvedValue(false));
const mockSendWelcome = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockUserFindUnique = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "user_1" }));

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn().mockReturnValue({
    webhooks: { constructEvent: mockConstructEvent },
    customers: { retrieve: mockCustomersRetrieve },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  }),
}));

vi.mock("@/lib/subscription", () => ({
  activateSubscription: mockActivate,
  deactivateSubscription: mockDeactivate,
  syncMonthlySubscription: mockSyncMonthly,
}));

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: mockUserFindUnique } } }));

vi.mock("@/lib/notify", () => ({ notifyOwner: vi.fn().mockResolvedValue(true), ownerEmail: () => "hello@learnaeo.com" }));

const mockRecordLead = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockGrantOffer = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const mockSendRecovery = vi.hoisted(() => vi.fn().mockResolvedValue(true));

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: mockSendWelcome,
  sendCheckoutRecoveryEmail: mockSendRecovery,
}));

vi.mock("@/lib/leads", () => ({ recordLead: mockRecordLead, normalizeEmail: (e: string) => e.trim().toLowerCase() }));

vi.mock("@/lib/offers", () => ({ grantOffer: mockGrantOffer, OFFER_PERCENT_OFF: 33 }));
const mockReminder = vi.hoisted(() => vi.fn().mockResolvedValue("sent"));
vi.mock("@/lib/checkout-reminder", () => ({ sendCheckoutReminderIfDue: mockReminder }));
const mockGA4 = vi.hoisted(() => vi.fn().mockResolvedValue(true));
vi.mock("@/lib/ga-server", () => ({ sendPurchaseToGA4: mockGA4 }));

import { POST } from "@/app/api/webhooks/stripe/route";

function makeWebhookRequest(body: string, signature: string | null): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature !== null) headers.set("stripe-signature", signature);
  return new Request("http://localhost/api/webhooks/stripe", { method: "POST", headers, body });
}

const send = () => POST(makeWebhookRequest("{}", "good-sig") as never);

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSyncMonthly.mockResolvedValue(false);
    mockUserFindUnique.mockResolvedValue({ id: "user_1" });
    mockSendRecovery.mockResolvedValue(true);
    mockReminder.mockResolvedValue("sent");
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.STRIPE_PRICE_MONTHLY = "price_monthly";
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const res = await POST(makeWebhookRequest("{}", null) as never);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/stripe-signature/i);
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const res = await POST(makeWebhookRequest("{}", "bad-sig") as never);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid signature.");
  });

  it("lifetime checkout: activates as lifetime and sends the welcome email", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { payment_status: "paid", customer_email: "buyer@example.com", customer: "cus_123", customer_details: { name: "Harry" }, metadata: { plan: "lifetime" } } },
    });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockActivate).toHaveBeenCalledWith("buyer@example.com", "cus_123", expect.objectContaining({ plan: "lifetime" }));
    expect(mockSendWelcome).toHaveBeenCalledWith("Harry", "buyer@example.com", "lifetime");
  });

  it("does not grant access for a checkout with an unknown or missing plan", async () => {
    const { notifyOwner } = await import("@/lib/notify");
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const paid = (metadata?: Record<string, string>) => ({
      type: "checkout.session.completed",
      data: { object: { id: "cs_u", payment_status: "paid", amount_total: 10000, currency: "usd", customer_email: "a@b.co", customer: "cus_u", subscription: "sub_u", customer_details: { name: "A" }, ...(metadata ? { metadata } : {}) } },
    });
    for (const event of [paid({ plan: "classroom", email: "a@b.co" }), paid({ plan: "school" }), paid({ email: "a@b.co" }), paid()]) {
      mockConstructEvent.mockReturnValue(event);
      const res = await send();
      expect(res.status).toBe(200);
    }
    expect(mockActivate).not.toHaveBeenCalled();
    expect(mockSendWelcome).not.toHaveBeenCalled();
    expect(mockGA4).not.toHaveBeenCalled();
    expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled();
    expect(errors.mock.calls.filter((c) => c[0] === "[stripe] unknown plan")).toHaveLength(4);
    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringMatching(/unknown plan/i) }));
    errors.mockRestore();
  });

  it("records a paid lifetime sale in GA4", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { id: "cs_l", payment_status: "paid", amount_total: 10000, currency: "usd", customer_email: "buyer@example.com", customer: "cus_123", customer_details: null, metadata: { plan: "lifetime" } } },
    });
    await send();
    expect(mockGA4).toHaveBeenCalledWith(expect.objectContaining({ transactionId: "cs_l", value: 100, plan: "lifetime" }));
  });

  it("still returns 200 when welcome email fails (payment is primary)", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { payment_status: "paid", customer_email: "buyer@example.com", customer: "cus_123", customer_details: null, metadata: { plan: "lifetime" } } },
    });
    mockSendWelcome.mockRejectedValueOnce(new Error("email down"));
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockActivate).toHaveBeenCalled();
  });

  describe("no access without payment", () => {
    const lifetime = (extra: Record<string, unknown>) => ({
      id: "cs_l",
      customer_email: "buyer@example.com",
      customer: "cus_123",
      customer_details: { name: "Harry" },
      metadata: { plan: "lifetime" },
      ...extra,
    });

    it("a completed checkout whose payment has not arrived (bank redirect, Klarna) unlocks nothing", async () => {
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: lifetime({ payment_status: "unpaid" }) } });
      const res = await send();
      expect(res.status).toBe(200);
      expect(mockActivate).not.toHaveBeenCalled();
      expect(mockSendWelcome).not.toHaveBeenCalled();
    });

    it("a checkout with no status at all unlocks nothing", async () => {
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: lifetime({}) } });
      await send();
      expect(mockActivate).not.toHaveBeenCalled();
    });

    it("nothing paid (a 100%-off code) unlocks nothing and tells the owner", async () => {
      const { notifyOwner } = await import("@/lib/notify");
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: lifetime({ payment_status: "no_payment_required" }) } });
      await send();
      expect(mockActivate).not.toHaveBeenCalled();
      expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringMatching(/nothing paid/i) }));
    });

    it("an unpaid monthly checkout unlocks nothing", async () => {
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: lifetime({ payment_status: "unpaid", subscription: "sub_m", metadata: { plan: "monthly" } }) } });
      await send();
      expect(mockActivate).not.toHaveBeenCalled();
      expect(mockGA4).not.toHaveBeenCalled();
    });

    it("the delayed payment arriving later unlocks the course then", async () => {
      mockConstructEvent.mockReturnValue({ type: "checkout.session.async_payment_succeeded", data: { object: lifetime({ payment_status: "paid" }) } });
      const res = await send();
      expect(res.status).toBe(200);
      expect(mockActivate).toHaveBeenCalledWith("buyer@example.com", "cus_123", expect.objectContaining({ plan: "lifetime" }));
      expect(mockSendWelcome).toHaveBeenCalledWith("Harry", "buyer@example.com", "lifetime");
    });

    it("a delayed payment that fails unlocks nothing and tells the owner", async () => {
      const { notifyOwner } = await import("@/lib/notify");
      mockConstructEvent.mockReturnValue({ type: "checkout.session.async_payment_failed", data: { object: lifetime({ payment_status: "unpaid" }) } });
      const res = await send();
      expect(res.status).toBe(200);
      expect(mockActivate).not.toHaveBeenCalled();
      expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringMatching(/payment failed/i) }));
    });

  });

  it("skips activation when email or customer id is missing", async () => {
    mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: { customer_email: null, customer: "cus_123" } } });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockActivate).not.toHaveBeenCalled();
  });

  it("monthly checkout: activates as monthly with the subscription id and period end", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { payment_status: "paid", customer_email: "m@example.com", customer: "cus_m", subscription: "sub_m", customer_details: { name: "Mo" }, metadata: { plan: "monthly" } } },
    });
    mockSubscriptionsRetrieve.mockResolvedValue({ id: "sub_m", items: { data: [{ current_period_end: 1_800_000_000 }] } });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockActivate).toHaveBeenCalledWith("m@example.com", "cus_m", expect.objectContaining({ plan: "monthly", stripeSubscriptionId: "sub_m", currentPeriodEnd: new Date(1_800_000_000 * 1000) }));
    expect(mockSendWelcome).toHaveBeenCalledWith("Mo", "m@example.com", "monthly");
  });

  it("subscription.updated for a known monthly row is synced, not routed to the legacy path", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.updated", data: { object: { id: "sub_m", status: "past_due", customer: "cus_m", items: { data: [{ current_period_end: 1_800_000_000 }] } } } });
    mockSyncMonthly.mockResolvedValue(true);
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockSyncMonthly).toHaveBeenCalledWith("sub_m", "past_due", new Date(1_800_000_000 * 1000));
    expect(mockCustomersRetrieve).not.toHaveBeenCalled();
  });

  it("legacy subscription.updated (unknown id) on the monthly price with status active → activates by customer email", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.updated", data: { object: { id: "sub_1", status: "active", customer: "cus_456", items: { data: [{ price: { id: "price_monthly" } }] } } } });
    mockCustomersRetrieve.mockResolvedValue({ email: "user@example.com" });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockActivate).toHaveBeenCalledWith("user@example.com", "cus_456", expect.objectContaining({ plan: "monthly" }));
    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  it("legacy subscription.updated for an active subscription on any other price grants nothing", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    mockCustomersRetrieve.mockResolvedValue({ email: "user@example.com" });
    for (const items of [{ data: [{ price: { id: "price_classroom_yearly" } }] }, { data: [] }, undefined]) {
      mockConstructEvent.mockReturnValue({ type: "customer.subscription.updated", data: { object: { id: "sub_2", status: "active", customer: "cus_456", ...(items ? { items } : {}) } } });
      expect((await send()).status).toBe(200);
    }
    expect(mockActivate).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it("legacy subscription.updated grants nothing when STRIPE_PRICE_MONTHLY is unset", async () => {
    delete process.env.STRIPE_PRICE_MONTHLY;
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.updated", data: { object: { id: "sub_3", status: "active", customer: "cus_456", items: { data: [{ price: { id: "price_monthly" } }] } } } });
    mockCustomersRetrieve.mockResolvedValue({ email: "user@example.com" });
    expect((await send()).status).toBe(200);
    expect(mockActivate).not.toHaveBeenCalled();
  });

  it("legacy subscription.updated with status canceled → deactivates", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.updated", data: { object: { id: "sub_1", status: "canceled", customer: "cus_456" } } });
    mockCustomersRetrieve.mockResolvedValue({ email: "user@example.com" });
    await send();
    expect(mockDeactivate).toHaveBeenCalledWith("user@example.com");
  });

  it("legacy subscription.deleted → deactivates", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.deleted", data: { object: { id: "sub_1", customer: "cus_456" } } });
    mockCustomersRetrieve.mockResolvedValue({ email: "user@example.com" });
    await send();
    expect(mockDeactivate).toHaveBeenCalledWith("user@example.com");
  });

  it("returns 200 for unhandled event types", async () => {
    mockConstructEvent.mockReturnValue({ type: "charge.succeeded", data: { object: {} } });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockActivate).not.toHaveBeenCalled();
    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  describe("abandoned Lifetime checkout", () => {
    const expired = (metadata: Record<string, string>) => ({
      type: "checkout.session.expired",
      data: { object: { id: "cs_x", mode: "payment", customer_email: "a@example.com", customer_details: null, metadata } },
    });

    it("earns a recovery offer", async () => {
      mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
      expect((await send()).status).toBe(200);
      expect(mockGrantOffer).toHaveBeenCalledWith("a@example.com", "checkout-abandoned");
    });

    it("earns none when the checkout already carried a bigger purchasing-power discount", async () => {
      mockConstructEvent.mockReturnValue(expired({ plan: "lifetime", ppp_country: "IN", ppp_tier: "D" }));
      expect((await send()).status).toBe(200);
      expect(mockGrantOffer).not.toHaveBeenCalled();
    });

    it("sends the discount email, not the plain reminder, when an offer is made", async () => {
      mockGrantOffer.mockResolvedValueOnce({ code: "AEO-ABC123", expiresAt: new Date(), percentOff: 33, source: "checkout-abandoned" });
      mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
      expect((await send()).status).toBe(200);
      expect(mockReminder).not.toHaveBeenCalled();
    });

    it("sends the plain reminder when no offer can be made", async () => {
      mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
      expect((await send()).status).toBe(200);
      expect(mockReminder).toHaveBeenCalledTimes(1);
    });

    it("sends the plain reminder to a parity-priced Lifetime checkout", async () => {
      mockConstructEvent.mockReturnValue(expired({ plan: "lifetime", ppp_country: "IN", ppp_tier: "D" }));
      expect((await send()).status).toBe(200);
      expect(mockReminder).toHaveBeenCalledTimes(1);
    });

    it("sends the plain reminder for the monthly plan and unknown plans, with no discount", async () => {
      for (const plan of ["monthly", "classroom", "school"]) {
        mockConstructEvent.mockReturnValue(expired({ plan }));
        expect((await send()).status).toBe(200);
      }
      expect(mockGrantOffer).not.toHaveBeenCalled();
      expect(mockReminder).toHaveBeenCalledTimes(3);
    });

    it("a checkout with no plan in its metadata earns no discount (it is not assumed to be Lifetime)", async () => {
      mockConstructEvent.mockReturnValue(expired({}));
      expect((await send()).status).toBe(200);
      expect(mockGrantOffer).not.toHaveBeenCalled();
      expect(mockReminder).toHaveBeenCalledTimes(1);
    });

    it("falls back to the reminder when making the offer fails", async () => {
      mockGrantOffer.mockRejectedValueOnce(new Error("stripe 403"));
      mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
      expect((await send()).status).toBe(200);
      expect(mockReminder).toHaveBeenCalledTimes(1);
    });

    it("still answers 200 when the reminder throws", async () => {
      mockReminder.mockRejectedValueOnce(new Error("db down"));
      mockConstructEvent.mockReturnValue(expired({ plan: "monthly" }));
      expect((await send()).status).toBe(200);
    });

    describe("records each outcome in EmailLead", () => {
      const sources = () => mockRecordLead.mock.calls.map((c) => c[0].source);

      it("the expiry and a new discount email", async () => {
        mockGrantOffer.mockResolvedValueOnce({ code: "AEO-ABC123", expiresAt: new Date(), percentOff: 33, source: "checkout-abandoned" });
        mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
        await send();
        expect(sources()).toEqual(["checkout-expired:cs_x", "checkout-recovery-sent:cs_x"]);
        expect(mockRecordLead).toHaveBeenCalledWith(expect.objectContaining({ email: "a@example.com" }));
      });

      it("a repeat of an offer they already held", async () => {
        mockGrantOffer.mockResolvedValueOnce({ code: "AEO-OLD111", expiresAt: new Date(), percentOff: 33, source: "nurture", reused: true });
        mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
        await send();
        expect(sources()).toEqual(["checkout-expired:cs_x", "checkout-recovery-resent:cs_x"]);
      });

      it("the plain reminder", async () => {
        mockConstructEvent.mockReturnValue(expired({ plan: "monthly" }));
        await send();
        expect(sources()).toEqual(["checkout-expired:cs_x", "checkout-reminder-sent:cs_x"]);
      });

      it("a skip, with the reminder's reason", async () => {
        mockReminder.mockResolvedValueOnce("cooldown");
        mockConstructEvent.mockReturnValue(expired({ plan: "classroom" }));
        await send();
        expect(sources()).toEqual(["checkout-expired:cs_x", "checkout-skipped:cooldown:cs_x"]);
      });

      it("a discount email Resend refused counts as not sent and falls back to the reminder", async () => {
        mockGrantOffer.mockResolvedValueOnce({ code: "AEO-ABC123", expiresAt: new Date(), percentOff: 33, source: "checkout-abandoned" });
        mockSendRecovery.mockResolvedValueOnce(false);
        mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
        await send();
        expect(mockReminder).toHaveBeenCalledTimes(1);
        expect(sources()).toEqual(["checkout-expired:cs_x", "checkout-reminder-sent:cs_x"]);
      });

      it("a reminder that throws is recorded as skipped", async () => {
        mockReminder.mockRejectedValueOnce(new Error("db down"));
        mockConstructEvent.mockReturnValue(expired({ plan: "monthly" }));
        await send();
        expect(sources()).toEqual(["checkout-expired:cs_x", "checkout-skipped:reminder-error:cs_x"]);
      });

      it("a session with no email writes no rows", async () => {
        mockReminder.mockResolvedValueOnce("no-email");
        mockConstructEvent.mockReturnValue({ type: "checkout.session.expired", data: { object: { id: "cs_y", customer_email: null, customer_details: null, metadata: { plan: "lifetime" } } } });
        expect((await send()).status).toBe(200);
        expect(mockGrantOffer).not.toHaveBeenCalled();
        expect(mockRecordLead).not.toHaveBeenCalled();
      });

    });
  });
});
