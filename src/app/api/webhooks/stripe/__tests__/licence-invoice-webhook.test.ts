import { describe, it, expect, vi, beforeEach } from "vitest";

/** The invoice.paid branch of the Stripe webhook: only our licence invoices are fulfilled. */
const mockConstructEvent = vi.hoisted(() => vi.fn());
const mockFulfil = vi.hoisted(() => vi.fn().mockResolvedValue("created"));

vi.mock("@/lib/stripe", () => ({ getStripe: () => ({ webhooks: { constructEvent: mockConstructEvent } }) }));
vi.mock("@/lib/licence-invoice", () => ({
  isLicenceInvoice: (inv: { metadata?: Record<string, string> | null }) => inv.metadata?.product === "licence-invoice",
  fulfilLicenceInvoice: mockFulfil,
}));
vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/notify", () => ({ notifyOwner: vi.fn().mockResolvedValue(true), ownerEmail: () => "contact@learnhieroglyphics.com" }));
vi.mock("@/lib/email", () => ({ sendWelcomeEmail: vi.fn(), sendLicenceEmail: vi.fn(), sendCheckoutRecoveryEmail: vi.fn(), sendCartouchePrintEmail: vi.fn() }));
vi.mock("@/lib/subscription", () => ({ activateSubscription: vi.fn(), deactivateSubscription: vi.fn(), syncMonthlySubscription: vi.fn() }));
vi.mock("@/lib/cartouche-print-pdf", () => ({ buildCartouchePrintPdf: vi.fn() }));
vi.mock("@/lib/cartouche-print-image", () => ({ renderCartouchePrintJpeg: vi.fn() }));
vi.mock("@/lib/keyboard-image", () => ({ renderKeyboardJpeg: vi.fn() }));

import { POST } from "@/app/api/webhooks/stripe/route";

const send = () => POST(new Request("http://localhost/api/webhooks/stripe", { method: "POST", headers: { "stripe-signature": "sig" }, body: "{}" }) as never);

describe("webhook: invoice.paid", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fulfils a licence invoice", async () => {
    const invoice = { id: "in_1", metadata: { product: "licence-invoice", plan: "school" } };
    mockConstructEvent.mockReturnValue({ type: "invoice.paid", data: { object: invoice } });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockFulfil).toHaveBeenCalledWith(invoice);
  });

  it("ignores subscription renewals and other invoices", async () => {
    mockConstructEvent.mockReturnValue({ type: "invoice.paid", data: { object: { id: "in_2", subscription: "sub_1", metadata: {} } } });
    const res = await send();
    expect(res.status).toBe(200);
    expect(mockFulfil).not.toHaveBeenCalled();
  });

  it("answers 500 so Stripe retries when fulfilment throws", async () => {
    mockConstructEvent.mockReturnValue({ type: "invoice.paid", data: { object: { id: "in_3", metadata: { product: "licence-invoice" } } } });
    mockFulfil.mockRejectedValueOnce(new Error("db down"));
    const res = await send();
    expect(res.status).toBe(500);
  });
});
