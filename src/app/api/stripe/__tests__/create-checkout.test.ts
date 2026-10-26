import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Keep the real createCheckoutSession: only the client is faked.
vi.mock("@/lib/stripe", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/stripe")>()),
  getStripe: vi.fn(),
}));

vi.mock("@/lib/offers", () => ({
  getActiveOffer: vi.fn().mockResolvedValue(null),
  promotionCodeIdFor: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn().mockResolvedValue({ active: false, trial: false, via: null, periodEnd: null, licence: null }),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/stripe/create-checkout/route";
import { getServerSession } from "next-auth";

const mockedGetServerSession = vi.mocked(getServerSession);

describe("POST /api/stripe/create-checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await POST(new NextRequest("http://localhost/api/stripe/create-checkout", { method: "POST" }));
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("You must be signed in to purchase.");
  });
});
