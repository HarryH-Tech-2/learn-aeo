import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSession = vi.hoisted(() => vi.fn());
const mockRequest = vi.hoisted(() => vi.fn());
vi.mock("next-auth", () => ({ getServerSession: mockSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => ({}) }));
vi.mock("@/lib/licence-invoice", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/licence-invoice")>()),
  requestLicenceInvoice: mockRequest,
}));
vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/notify", () => ({ notifyOwner: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendLicenceEmail: vi.fn() }));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/licence/invoice/route";

const body = { plan: "school", schoolName: "St Mary's", contactName: "Jo", contactEmail: "jo@school.org", line1: "1 Lane", city: "York", postcode: "YO1", country: "GB" };
let n = 0;
const post = (b: unknown) =>
  POST(new NextRequest("http://localhost/api/licence/invoice", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++n}` }, body: JSON.stringify(b) }));

describe("POST /api/licence/invoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    mockSession.mockResolvedValue({ user: { id: `user-${n}`, email: "Teacher@School.org" } });
    mockRequest.mockResolvedValue({ mode: "sent", invoice: { invoiceId: "in_1", customerId: "cus_1", number: "N-1", hostedInvoiceUrl: "https://x" } });
  });

  it("needs a signed-in teacher", async () => {
    mockSession.mockResolvedValue(null);
    expect((await post(body)).status).toBe(401);
  });

  it("rejects an incomplete form", async () => {
    const res = await post({ ...body, contactEmail: "" });
    expect(res.status).toBe(400);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("sends the invoice for the signed-in account", async () => {
    const res = await post(body);
    expect(await res.json()).toEqual({ ok: true, mode: "sent", number: "N-1", hostedInvoiceUrl: "https://x", dueDays: 30 });
    expect(mockRequest.mock.calls[0][2]).toMatchObject({ email: "teacher@school.org" });
  });

  it("reports the hand-raised fallback", async () => {
    mockRequest.mockResolvedValue({ mode: "manual" });
    expect(await (await post(body)).json()).toEqual({ ok: true, mode: "manual" });
  });

  it("throttles a fourth request in an hour from the same account", async () => {
    mockSession.mockResolvedValue({ user: { id: "same-user", email: "t@school.org" } });
    for (let i = 0; i < 3; i++) expect((await post(body)).status).toBe(200);
    expect((await post(body)).status).toBe(429);
  });
});
