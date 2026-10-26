import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const mockPortalCreate = vi.hoisted(() => vi.fn().mockResolvedValue({ url: "https://billing.stripe.com/session/test" }));
vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn().mockReturnValue({
    billingPortal: { sessions: { create: mockPortalCreate } },
  }),
}));

import { POST } from "@/app/api/stripe/create-portal-session/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

const mockedGetServerSession = vi.mocked(getServerSession);
const mockedFindUnique = vi.mocked(prisma.user.findUnique);

const req = (body?: unknown) =>
  new Request("http://localhost/api/stripe/create-portal-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("POST /api/stripe/create-portal-session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const response = await POST(req());
    expect(response.status).toBe(401);
  });

  it("returns 404 when the user has neither a purchase nor a licence", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "harry@example.com" } });
    mockedFindUnique.mockResolvedValue({ subscription: null, ownedLicences: [] } as never);
    const response = await POST(req());
    expect(response.status).toBe(404);
  });

  it("returns portal URL for the user's own Stripe customer", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "harry@example.com" } });
    mockedFindUnique.mockResolvedValue({ subscription: { stripeCustomerId: "cus_test123" }, ownedLicences: [] } as never);
    const response = await POST(req());
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.url).toBe("https://billing.stripe.com/session/test");
    expect(mockPortalCreate).toHaveBeenCalledWith(expect.objectContaining({ customer: "cus_test123", return_url: "http://localhost:3000/account" }));
  });

  it("falls back to a licence's customer and honours a safe returnTo", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "t@example.com" } });
    mockedFindUnique.mockResolvedValue({ subscription: null, ownedLicences: [{ stripeCustomerId: "cus_lic" }] } as never);
    const response = await POST(req({ returnTo: "/teachers/licence" }));
    expect(response.status).toBe(200);
    expect(mockPortalCreate).toHaveBeenCalledWith(expect.objectContaining({ customer: "cus_lic", return_url: "http://localhost:3000/teachers/licence" }));
  });

  it("ignores an off-site returnTo", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: "t@example.com" } });
    mockedFindUnique.mockResolvedValue({ subscription: { stripeCustomerId: "cus_x" }, ownedLicences: [] } as never);
    await POST(req({ returnTo: "https://evil.example" }));
    expect(mockPortalCreate).toHaveBeenCalledWith(expect.objectContaining({ return_url: "http://localhost:3000/account" }));
  });
});
