import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

const sent = vi.hoisted(() => ({ ga: [] as unknown[], leads: [] as unknown[], mails: [] as { to: string; input: unknown; bytes: number }[], owner: [] as unknown[] }));

vi.mock("@/lib/ga-server", () => ({ sendPurchaseToGA4: async (p: unknown) => (sent.ga.push(p), true) }));
vi.mock("@/lib/leads", () => ({ recordLead: async (l: unknown) => void sent.leads.push(l) }));
vi.mock("@/lib/notify", () => ({ notifyOwner: async (n: unknown) => (sent.owner.push(n), true), ownerEmail: () => "owner@test" }));
vi.mock("@/lib/unit-pack/email", () => ({
  sendUnitPackEmail: async (to: string, pdf: Uint8Array, input: unknown) => void sent.mails.push({ to, input, bytes: pdf.byteLength }),
}));

import { fulfilUnitPack, isUnitPackSession } from "@/lib/unit-pack/fulfil";

const session = (over: Partial<Stripe.Checkout.Session> = {}) =>
  ({
    id: "cs_test_abc12345",
    payment_status: "paid",
    amount_total: 1500,
    currency: "gbp",
    customer_details: { name: "Ms Teacher" },
    metadata: { product: "unit-pack", paper: "a4", from: "worksheet", ga_client_id: "1.2", ga_session_id: "3" },
    ...over,
  }) as unknown as Stripe.Checkout.Session;

describe("fulfilUnitPack", () => {
  beforeEach(() => {
    sent.ga.length = sent.leads.length = sent.mails.length = sent.owner.length = 0;
  });

  it("recognises its sessions", () => {
    expect(isUnitPackSession(session())).toBe(true);
    expect(isUnitPackSession(session({ metadata: { product: "keyboard-image" } }))).toBe(false);
  });

  it("counts the sale, keeps the lead, emails the PDF and tells the owner", async () => {
    await fulfilUnitPack(session(), "t@school.org");
    expect(sent.ga).toEqual([expect.objectContaining({ transactionId: "cs_test_abc12345", value: 15, currency: "gbp", plan: "unit-pack" })]);
    expect(sent.leads).toEqual([{ email: "t@school.org", source: "unit-pack", name: "Ms Teacher" }]);
    expect(sent.mails).toHaveLength(1);
    expect(sent.mails[0].to).toBe("t@school.org");
    expect(sent.mails[0].bytes).toBeGreaterThan(50000);
    expect(JSON.stringify(sent.mails[0].input)).toContain("/api/unit-pack/download?session_id=cs_test_abc12345&paper=letter");
    expect(sent.owner).toHaveLength(1);
  }, 30000);

  it("does nothing for an unpaid session", async () => {
    await fulfilUnitPack(session({ payment_status: "unpaid" }), "t@school.org");
    expect(sent.ga.length + sent.mails.length + sent.leads.length).toBe(0);
  });
});
