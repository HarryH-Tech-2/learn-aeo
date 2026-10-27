import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  prisma: {
    userBadge: { findMany: vi.fn(async () => []) },
    gameState: { findMany: vi.fn(async () => []) },
    user: { findUnique: vi.fn(async () => ({ heardAbout: "search" })) },
  },
}));
vi.mock("@/lib/progress", () => ({ getUserProgress: vi.fn(async () => ({ totalXP: 0, lessons: {} })) }));
vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn(async () => ({ active: true })) }));
vi.mock("@/lib/offers", () => ({ getActiveOffer: vi.fn(async () => null) }));

import { GET } from "@/app/api/me/route";
import { getServerSession } from "next-auth";
import { CONTENT } from "@/lib/lessons";

const mockedSession = vi.mocked(getServerSession);

describe("GET /api/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ user: { id: "u1", email: "a@example.com" } });
  });

  it("is 401 without a session", async () => {
    mockedSession.mockResolvedValue(null);
    expect((await GET(new Request("http://localhost:3000/api/me"))).status).toBe(401);
  });

  it("sends each live lesson's audit length from the content registry", async () => {
    const res = await GET(new Request("http://localhost:3000/api/me"));
    expect(res.status).toBe(200);
    const body = await res.json();
    const expected = Object.fromEntries(Object.entries(CONTENT).map(([id, c]) => [id, c.audit.length]));
    expect(body.auditLengths).toEqual(expected);
    expect(body.auditLengths["how-answer-engines-choose-sources"]).toBeGreaterThan(0);
  });
});
