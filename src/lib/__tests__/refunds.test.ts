import { describe, expect, it, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

const mockSessionsList = vi.hoisted(() => vi.fn());
const mockChargesRetrieve = vi.hoisted(() => vi.fn());
const mockRevoke = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockNotify = vi.hoisted(() => vi.fn().mockResolvedValue(true));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ checkout: { sessions: { list: mockSessionsList } }, charges: { retrieve: mockChargesRetrieve } }),
}));
vi.mock("@/lib/subscription", () => ({ revokeLifetime: mockRevoke }));
vi.mock("@/lib/notify", () => ({ notifyOwner: mockNotify }));

import { formatMoney, handleDispute, handleRefund, heldFor, purchaseKind } from "../refunds";

const session = (metadata: Record<string, string>) => ({
  data: [{ metadata, customer_email: "buyer@example.com", customer_details: { name: "Buyer", email: "buyer@example.com" } }],
});

function charge(over: Partial<Stripe.Charge> = {}): Stripe.Charge {
  return {
    id: "ch_1",
    payment_intent: "pi_1",
    amount: 10000,
    amount_refunded: 10000,
    refunded: true,
    currency: "usd",
    created: Math.floor(Date.now() / 1000) - 3 * 86400,
    billing_details: { email: null, name: null },
    receipt_email: null,
    ...over,
  } as unknown as Stripe.Charge;
}

beforeEach(() => vi.clearAllMocks());

describe("purchaseKind", () => {
  it("reads the plan or product from the checkout metadata", () => {
    expect(purchaseKind({ plan: "lifetime" }, true).kind).toBe("lifetime");
    expect(purchaseKind({}, true).kind).toBe("unknown"); // the webhook never granted a checkout with no plan
    expect(purchaseKind({ plan: "monthly" }, true).kind).toBe("monthly");
    expect(purchaseKind({ plan: "classroom" }, true).kind).toBe("unknown");
    expect(purchaseKind({ plan: "school" }, true).kind).toBe("unknown");
    expect(purchaseKind({ product: "unit-pack", plan: "lifetime" }, true).kind).toBe("product");
    expect(purchaseKind(null, false).kind).toBe("unknown");
  });
});

describe("formatMoney / heldFor", () => {
  it("formats", () => {
    expect(formatMoney(10000, "usd")).toBe("US$100.00");
    expect(formatMoney(1199, "gbp")).toBe("£11.99");
    expect(heldFor(0, 3600)).toBe("under a day");
    expect(heldFor(0, 86400)).toBe("1 day");
    expect(heldFor(0, 5 * 86400 + 10)).toBe("5 days");
  });
});

describe("handleRefund", () => {
  it("removes lifetime access on a full refund and tells the owner", async () => {
    mockSessionsList.mockResolvedValue(session({ plan: "lifetime" }));
    await handleRefund(charge());
    expect(mockRevoke).toHaveBeenCalledWith("buyer@example.com");
    const mail = mockNotify.mock.calls[0][0];
    expect(mail.subject).toBe("Refund: buyer@example.com");
    expect(mail.text).toContain("US$100.00 of US$100.00 for Lifetime access, 3 days after paying");
    expect(mail.text).toContain("lifetime access has been removed");
  });

  it("keeps access on a partial refund", async () => {
    mockSessionsList.mockResolvedValue(session({ plan: "lifetime" }));
    await handleRefund(charge({ refunded: false, amount_refunded: 500 }));
    expect(mockRevoke).not.toHaveBeenCalled();
    expect(mockNotify.mock.calls[0][0].subject).toBe("Partial refund: buyer@example.com");
  });

  it("leaves monthly passes and products to the owner", async () => {
    mockSessionsList.mockResolvedValue(session({ plan: "monthly" }));
    await handleRefund(charge());
    expect(mockRevoke).not.toHaveBeenCalled();
    expect(mockNotify.mock.calls[0][0].text).toContain("cancel the subscription in Stripe");
  });

  it("still emails when the charge has no checkout session", async () => {
    mockSessionsList.mockResolvedValue({ data: [] });
    await handleRefund(charge({ receipt_email: "x@example.com" }));
    expect(mockRevoke).not.toHaveBeenCalled();
    expect(mockNotify.mock.calls[0][0].subject).toBe("Refund: x@example.com");
  });
});

describe("handleDispute", () => {
  const dispute = (over: Partial<Stripe.Dispute> = {}) =>
    ({ id: "dp_1", charge: "ch_1", amount: 10000, currency: "usd", reason: "fraudulent", status: "needs_response", evidence_details: { due_by: 1800000000 }, ...over }) as unknown as Stripe.Dispute;

  beforeEach(() => {
    mockChargesRetrieve.mockResolvedValue(charge({ refunded: false }));
    mockSessionsList.mockResolvedValue(session({ plan: "lifetime" }));
  });

  it("emails on a new dispute without touching access", async () => {
    await handleDispute(dispute(), false);
    expect(mockRevoke).not.toHaveBeenCalled();
    expect(mockNotify.mock.calls[0][0].subject).toBe("Dispute opened: buyer@example.com");
  });

  it("removes lifetime access when the dispute is lost", async () => {
    await handleDispute(dispute({ status: "lost" }), true);
    expect(mockRevoke).toHaveBeenCalledWith("buyer@example.com");
  });

  it("keeps access when the dispute is won", async () => {
    await handleDispute(dispute({ status: "won" }), true);
    expect(mockRevoke).not.toHaveBeenCalled();
    expect(mockNotify.mock.calls[0][0].subject).toBe("Dispute won: buyer@example.com");
  });
});
