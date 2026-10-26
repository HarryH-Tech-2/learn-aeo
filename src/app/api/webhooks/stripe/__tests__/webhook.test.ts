import { describe, it, expect, vi, beforeEach } from "vitest";

const mockConstructEvent = vi.hoisted(() => vi.fn());
const mockCustomersRetrieve = vi.hoisted(() => vi.fn());
const mockSubscriptionsRetrieve = vi.hoisted(() => vi.fn());
const mockActivate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockDeactivate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockSyncMonthly = vi.hoisted(() => vi.fn().mockResolvedValue(false));
const mockSyncLicence = vi.hoisted(() => vi.fn().mockResolvedValue(false));
const mockCreateLicence = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "lic_1", code: "ABCD-EFGH" }));
const mockSendWelcome = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockSendLicence = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
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

vi.mock("@/lib/licence", () => ({
  createLicence: mockCreateLicence,
  syncLicenceSubscription: mockSyncLicence,
  isLicenceKind: (x: unknown) => x === "classroom" || x === "school",
}));

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: mockUserFindUnique } } }));

vi.mock("@/lib/notify", () => ({ notifyOwner: vi.fn().mockResolvedValue(true), ownerEmail: () => "contact@learnhieroglyphics.com" }));

const mockSendPrint = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockBuildPdf = vi.hoisted(() => vi.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46])));
const mockRecordLead = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockGrantOffer = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const mockSendRecovery = vi.hoisted(() => vi.fn().mockResolvedValue(true));

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: mockSendWelcome,
  sendLicenceEmail: mockSendLicence,
  sendCheckoutRecoveryEmail: mockSendRecovery,
  sendCartouchePrintEmail: mockSendPrint,
}));

vi.mock("@/lib/cartouche-print-pdf", () => ({ buildCartouchePrintPdf: mockBuildPdf }));
const mockRenderJpeg = vi.hoisted(() => vi.fn().mockResolvedValue(Buffer.from([0xff, 0xd8, 0xff])));
vi.mock("@/lib/cartouche-print-image", () => ({ renderCartouchePrintJpeg: mockRenderJpeg }));

const mockCreateProdigiOrder = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "ord_1", status: { stage: "InProgress" } }));
const mockProdigiConfigured = vi.hoisted(() => vi.fn().mockReturnValue(true));
vi.mock("@/lib/prodigi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/prodigi")>()),
  createProdigiOrder: mockCreateProdigiOrder,
  prodigiConfigured: mockProdigiConfigured,
}));
vi.mock("@/lib/leads", () => ({ recordLead: mockRecordLead, normaliseEmail: (e: string) => e.trim().toLowerCase() }));

vi.mock("@/lib/offers", () => ({ grantOffer: mockGrantOffer, OFFER_PERCENT_OFF: 33 }));
const mockReminder = vi.hoisted(() => vi.fn().mockResolvedValue("sent"));
vi.mock("@/lib/checkout-reminder", () => ({ sendCheckoutReminderIfDue: mockReminder }));

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
    mockSyncLicence.mockResolvedValue(false);
    mockUserFindUnique.mockResolvedValue({ id: "user_1" });
    mockSendRecovery.mockResolvedValue(true);
    mockReminder.mockResolvedValue("sent");
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
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

  it("checkout with no plan metadata (old sessions) is treated as lifetime", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { payment_status: "paid", customer_email: "buyer@example.com", customer: "cus_123", customer_details: null } },
    });
    await send();
    expect(mockActivate).toHaveBeenCalledWith("buyer@example.com", "cus_123", expect.objectContaining({ plan: "lifetime" }));
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

    it("an unpaid monthly or licence checkout unlocks nothing", async () => {
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: lifetime({ payment_status: "unpaid", subscription: "sub_t", metadata: { plan: "classroom" } }) } });
      await send();
      expect(mockCreateLicence).not.toHaveBeenCalled();
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: lifetime({ payment_status: "unpaid", subscription: "sub_m", metadata: { plan: "monthly" } }) } });
      await send();
      expect(mockActivate).not.toHaveBeenCalled();
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

    it("a print paid by a delayed method is sent when the payment arrives", async () => {
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.async_payment_succeeded",
        data: { object: { id: "cs_p", customer_email: "a@example.com", payment_status: "paid", amount_total: 399, currency: "usd", metadata: { product: "cartouche-print", name: "Harry", theme: "papyrus", format: "image" } } },
      });
      await send();
      expect(mockSendPrint).toHaveBeenCalled();
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
    expect(mockCreateLicence).not.toHaveBeenCalled();
  });

  it("classroom checkout: creates a licence for the buyer and emails the code", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { payment_status: "paid", customer_email: "t@example.com", customer: "cus_t", subscription: "sub_t", customer_details: { name: "Ms T" }, metadata: { plan: "classroom" } } },
    });
    mockSubscriptionsRetrieve.mockResolvedValue({ id: "sub_t", items: { data: [{ current_period_end: 1_800_000_000 }] } });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockCreateLicence).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: "user_1", kind: "classroom", stripeSubscriptionId: "sub_t", stripeCustomerId: "cus_t" }));
    expect(mockSendLicence).toHaveBeenCalledWith(expect.objectContaining({ email: "t@example.com", kind: "classroom", code: "ABCD-EFGH" }));
    expect(mockActivate).not.toHaveBeenCalled();
  });

  it("subscription.updated for a known monthly row is synced, not routed to the legacy path", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.updated", data: { object: { id: "sub_m", status: "past_due", customer: "cus_m", items: { data: [{ current_period_end: 1_800_000_000 }] } } } });
    mockSyncMonthly.mockResolvedValue(true);
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockSyncMonthly).toHaveBeenCalledWith("sub_m", "past_due", new Date(1_800_000_000 * 1000));
    expect(mockCustomersRetrieve).not.toHaveBeenCalled();
  });

  it("subscription.deleted for a licence marks it canceled", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.deleted", data: { object: { id: "sub_t", status: "canceled", customer: "cus_t" } } });
    mockSyncLicence.mockResolvedValue(true);
    await send();
    expect(mockSyncLicence).toHaveBeenCalledWith("sub_t", "canceled", null);
    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  it("legacy subscription.updated (unknown id) with status active → activates by customer email", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.subscription.updated", data: { object: { id: "sub_1", status: "active", customer: "cus_456" } } });
    mockCustomersRetrieve.mockResolvedValue({ email: "user@example.com" });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockActivate).toHaveBeenCalledWith("user@example.com", "cus_456", expect.objectContaining({ plan: "monthly" }));
    expect(mockDeactivate).not.toHaveBeenCalled();
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

  describe("cartouche print", () => {
    const printSession = (extra: Record<string, unknown> = {}) => ({
      id: "cs_test_print",
      customer_email: null,
      customer: null,
      customer_details: { email: "buyer@example.com", name: "Harry" },
      payment_status: "paid",
      amount_total: 1999,
      currency: "usd",
      metadata: { product: "cartouche-print", name: "Harry" },
      ...extra,
    });

    it("emails the PDF, keeps the lead, and never touches plans or subscriptions", async () => {
      process.env.NEXTAUTH_URL = "https://test.example.com";
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: printSession() } });
      const res = await send();
      expect(res.status).toBe(200);
      expect(mockBuildPdf).toHaveBeenCalledWith("Harry", "cream");
      expect(mockCreateProdigiOrder).not.toHaveBeenCalled();
      expect(mockSendPrint).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "buyer@example.com",
          name: "Harry",
          format: "digital",
          filename: "harry-cartouche-print.pdf",
          downloadUrl: "https://test.example.com/api/cartouche-print/download?session_id=cs_test_print",
        })
      );
      expect(mockRecordLead).toHaveBeenCalledWith({ email: "buyer@example.com", source: "cartouche-print", name: "Harry" });
      expect(mockActivate).not.toHaveBeenCalled();
      expect(mockSendWelcome).not.toHaveBeenCalled();
      expect(mockCreateLicence).not.toHaveBeenCalled();
    });

    it("emails the HD image, not the PDF, for the image format, and places no print", async () => {
      process.env.NEXTAUTH_URL = "https://test.example.com";
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: printSession({ amount_total: 399, metadata: { product: "cartouche-print", name: "Harry", theme: "papyrus", format: "image" } }) },
      });
      await send();
      expect(mockRenderJpeg).toHaveBeenCalledWith("Harry", "papyrus", "hd");
      expect(mockBuildPdf).not.toHaveBeenCalled();
      expect(mockCreateProdigiOrder).not.toHaveBeenCalled();
      expect(mockSendPrint).toHaveBeenCalledWith(
        expect.objectContaining({
          format: "image",
          filename: "harry-cartouche-papyrus-hd.jpg",
          downloadUrl: "https://test.example.com/api/cartouche-print/image?session_id=cs_test_print",
        })
      );
    });

    it("builds the PDF on the paper the buyer chose", async () => {
      process.env.NEXTAUTH_URL = "https://test.example.com";
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: printSession({ metadata: { product: "cartouche-print", name: "Harry", theme: "night" } }) },
      });
      await send();
      expect(mockBuildPdf).toHaveBeenCalledWith("Harry", "night");
    });

    it("a posted print is placed with Prodigi against the shipping address, with the signed artwork URL", async () => {
      process.env.NEXTAUTH_URL = "https://test.example.com";
      process.env.NEXTAUTH_SECRET = "test-secret";
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: printSession({
            amount_total: 7999,
            metadata: { product: "cartouche-print", name: "Harry", theme: "temple", format: "framed" },
            shipping_details: {
              name: "Harry Harrison",
              address: { line1: "1 Nile St", line2: "Flat 2", city: "London", state: null, postal_code: "N1 1AA", country: "GB" },
            },
          }),
        },
      });
      const res = await send();
      expect(res.status).toBe(200);
      expect(mockCreateProdigiOrder).toHaveBeenCalledTimes(1);
      const order = mockCreateProdigiOrder.mock.calls[0][0];
      expect(order).toMatchObject({
        sessionId: "cs_test_print",
        format: "framed",
        recipient: { name: "Harry Harrison", email: "buyer@example.com", line1: "1 Nile St", line2: "Flat 2", city: "London", postcode: "N1 1AA", country: "GB" },
        callbackUrl: "https://test.example.com/api/prodigi/callback",
        idempotencyKey: "cs_test_print",
      });
      expect(order.assetUrl).toMatch(/^https:\/\/test\.example\.com\/api\/cartouche-print\/asset\?session_id=cs_test_print&sig=[0-9a-f]{64}$/);
      expect(mockSendPrint).toHaveBeenCalledWith(expect.objectContaining({ format: "framed" }));
      const { notifyOwner } = await import("@/lib/notify");
      const subjects = vi.mocked(notifyOwner).mock.calls.map((c) => c[0].subject);
      expect(subjects.some((x) => x.startsWith("Cartouche Print sold (Framed A4 print)"))).toBe(true);
    });

    it("a family print builds every name into the file and the email, and names them all to the owner", async () => {
      process.env.NEXTAUTH_URL = "https://test.example.com";
      process.env.NEXTAUTH_SECRET = "test-secret";
      const { notifyOwner } = await import("@/lib/notify");
      vi.mocked(notifyOwner).mockClear();
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: printSession({
            amount_total: 3999,
            metadata: { product: "cartouche-print", name: "Harry", names: "Harry|Sally|Tom", theme: "night", format: "print" },
            shipping_details: {
              name: "Harry Harrison",
              address: { line1: "1 Nile St", line2: null, city: "London", state: null, postal_code: "N1 1AA", country: "GB" },
            },
          }),
        },
      });
      expect((await send()).status).toBe(200);
      expect(mockBuildPdf).toHaveBeenCalledWith(["Harry", "Sally", "Tom"], "night");
      expect(mockSendPrint).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Harry, Sally and Tom", family: true, format: "print", filename: "harry-sally-tom-cartouche-print.pdf" })
      );
      // Prodigi fetches the artwork from the asset route, which rebuilds the family page from the same session.
      expect(mockCreateProdigiOrder).toHaveBeenCalledWith(expect.objectContaining({ format: "print" }));
      const subjects = vi.mocked(notifyOwner).mock.calls.map((c) => c[0].subject);
      expect(subjects.some((x) => x === "Cartouche Print sold (A4 print, posted): Harry, Sally and Tom")).toBe(true);
    });

    it("a family HD image renders every name", async () => {
      process.env.NEXTAUTH_URL = "https://test.example.com";
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: printSession({ amount_total: 399, metadata: { product: "cartouche-print", name: "Harry", names: "Harry|Sally", theme: "papyrus", format: "image" } }) },
      });
      expect((await send()).status).toBe(200);
      expect(mockRenderJpeg).toHaveBeenCalledWith(["Harry", "Sally"], "papyrus", "hd");
      expect(mockSendPrint).toHaveBeenCalledWith(expect.objectContaining({ filename: "harry-sally-cartouche-papyrus-hd.jpg" }));
    });

    it("a posted print without an address, or with Prodigi refusing, still emails the PDF and asks the owner to place it by hand", async () => {
      process.env.NEXTAUTH_URL = "https://test.example.com";
      process.env.NEXTAUTH_SECRET = "test-secret";
      const { notifyOwner } = await import("@/lib/notify");
      vi.mocked(notifyOwner).mockClear();

      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: printSession({ metadata: { product: "cartouche-print", name: "Harry", format: "print" } }) },
      });
      await send();
      expect(mockCreateProdigiOrder).not.toHaveBeenCalled();
      expect(mockSendPrint).toHaveBeenCalledTimes(1);
      expect(vi.mocked(notifyOwner).mock.calls[0][0].subject).toMatch(/^ACTION NEEDED/);
      expect(vi.mocked(notifyOwner).mock.calls[0][0].text).toContain("no shipping address");

      mockCreateProdigiOrder.mockRejectedValueOnce(new Error("Prodigi order failed (400 ValidationFailed): bad sku"));
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: printSession({
            metadata: { product: "cartouche-print", name: "Harry", format: "print" },
            shipping_details: { name: "H", address: { line1: "1 Nile St", city: "London", postal_code: "N1 1AA", country: "GB" } },
          }),
        },
      });
      const res = await send();
      expect(res.status).toBe(200);
      expect(mockSendPrint).toHaveBeenCalledTimes(2);
      expect(vi.mocked(notifyOwner).mock.calls[1][0].subject).toMatch(/^ACTION NEEDED/);
      expect(vi.mocked(notifyOwner).mock.calls[1][0].text).toContain("bad sku");
    });

    it("does nothing for an unpaid print session", async () => {
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: printSession({ payment_status: "unpaid" }) } });
      expect((await send()).status).toBe(200);
      expect(mockBuildPdf).not.toHaveBeenCalled();
      expect(mockSendPrint).not.toHaveBeenCalled();
      expect(mockActivate).not.toHaveBeenCalled();
    });

    it("still answers 200 when the email fails, since the download page can serve the PDF", async () => {
      mockSendPrint.mockRejectedValueOnce(new Error("resend down"));
      mockConstructEvent.mockReturnValue({ type: "checkout.session.completed", data: { object: printSession() } });
      expect((await send()).status).toBe(200);
    });

    it("an abandoned print checkout does not earn a Lifetime recovery offer", async () => {
      mockConstructEvent.mockReturnValue({ type: "checkout.session.expired", data: { object: printSession({ payment_status: "unpaid" }) } });
      expect((await send()).status).toBe(200);
      expect(mockGrantOffer).not.toHaveBeenCalled();
      expect(mockReminder).not.toHaveBeenCalled();
    });
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
      mockGrantOffer.mockResolvedValueOnce({ code: "SCRIBE-ABC123", expiresAt: new Date(), percentOff: 33, source: "checkout-abandoned" });
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

    it("sends the plain reminder for the monthly pass and licences, with no discount", async () => {
      for (const plan of ["monthly", "classroom", "school"]) {
        mockConstructEvent.mockReturnValue(expired({ plan }));
        expect((await send()).status).toBe(200);
      }
      expect(mockGrantOffer).not.toHaveBeenCalled();
      expect(mockReminder).toHaveBeenCalledTimes(3);
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
        mockGrantOffer.mockResolvedValueOnce({ code: "SCRIBE-ABC123", expiresAt: new Date(), percentOff: 33, source: "checkout-abandoned" });
        mockConstructEvent.mockReturnValue(expired({ plan: "lifetime" }));
        await send();
        expect(sources()).toEqual(["checkout-expired:cs_x", "checkout-recovery-sent:cs_x"]);
        expect(mockRecordLead).toHaveBeenCalledWith(expect.objectContaining({ email: "a@example.com" }));
      });

      it("a repeat of an offer they already held", async () => {
        mockGrantOffer.mockResolvedValueOnce({ code: "SCRIBE-OLD111", expiresAt: new Date(), percentOff: 33, source: "nurture", reused: true });
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
        mockGrantOffer.mockResolvedValueOnce({ code: "SCRIBE-ABC123", expiresAt: new Date(), percentOff: 33, source: "checkout-abandoned" });
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

      it("print checkouts are not recorded", async () => {
        mockConstructEvent.mockReturnValue({ type: "checkout.session.expired", data: { object: { id: "cs_p", customer_email: "a@example.com", payment_status: "unpaid", metadata: { product: "cartouche-print", name: "Harry" } } } });
        await send();
        expect(mockRecordLead).not.toHaveBeenCalled();
      });
    });
  });
});
