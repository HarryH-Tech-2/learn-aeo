import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/subscription", () => ({
  checkSubscription: vi.fn(),
}));

import { GET } from "@/app/api/stripe/check-subscription/route";
import { getServerSession } from "next-auth";

const mockedGetServerSession = vi.mocked(getServerSession);

describe("GET /api/stripe/check-subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active: false when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.active).toBe(false);
  });
});
