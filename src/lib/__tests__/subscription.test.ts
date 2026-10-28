import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/db";
import { checkSubscription, hasPaidAccess } from "@/lib/subscription";

const findUnique = vi.mocked(prisma.user.findUnique);
const now = new Date("2026-09-08T12:00:00Z");
const day = 86_400_000;

describe("checkSubscription — who counts as paid", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unknown email → not active", async () => {
    findUnique.mockResolvedValue(null as never);
    expect((await checkSubscription("nobody@example.com", now)).active).toBe(false);
  });

  it("PENDING user with no subscription row → not active", async () => {
    findUnique.mockResolvedValue({ status: "PENDING", subscription: null } as never);
    const r = await checkSubscription("a@example.com", now);
    expect(r.active).toBe(false);
    expect(r.via).toBeNull();
  });

  it("subscription.active=true lifetime → active via lifetime", async () => {
    findUnique.mockResolvedValue({ status: "ACTIVE", subscription: { active: true, trial: false, plan: "lifetime" } } as never);
    const r = await checkSubscription("a@example.com", now);
    expect(r.active).toBe(true);
    expect(r.via).toBe("lifetime");
  });

  it("status=ACTIVE but subscription flag flipped off by a legacy webhook → still active", async () => {
    findUnique.mockResolvedValue({ status: "ACTIVE", subscription: { active: false, trial: false, plan: "lifetime" } } as never);
    expect((await checkSubscription("a@example.com", now)).active).toBe(true);
  });

  it("status=ACTIVE with no subscription row at all → still active", async () => {
    findUnique.mockResolvedValue({ status: "ACTIVE", subscription: null } as never);
    expect((await checkSubscription("a@example.com", now)).active).toBe(true);
  });

  it("legacy row without a plan column value counts as lifetime", async () => {
    findUnique.mockResolvedValue({ status: "PENDING", subscription: { active: true, trial: false, plan: undefined } } as never);
    expect((await checkSubscription("a@example.com", now)).via).toBe("lifetime");
  });

  it("PENDING user whose subscription row is inactive (abandoned checkout) → not active", async () => {
    findUnique.mockResolvedValue({ status: "PENDING", subscription: { active: false, trial: false, plan: "lifetime" } } as never);
    expect((await checkSubscription("a@example.com", now)).active).toBe(false);
  });

  it("monthly: active inside the period, lapsed after grace", async () => {
    findUnique.mockResolvedValue({ status: "PENDING", subscription: { active: true, trial: false, plan: "monthly", currentPeriodEnd: new Date(now.getTime() + 10 * day) } } as never);
    const r = await checkSubscription("a@example.com", now);
    expect(r.active).toBe(true);
    expect(r.via).toBe("monthly");
    expect(r.periodEnd).toBeTruthy();

    findUnique.mockResolvedValue({ status: "PENDING", subscription: { active: true, trial: false, plan: "monthly", currentPeriodEnd: new Date(now.getTime() - 30 * day) } } as never);
    expect((await checkSubscription("a@example.com", now)).active).toBe(false);
  });

  it("has no license branch: only lifetime, monthly and free-unlock grant access", async () => {
    findUnique.mockResolvedValue({ status: "PENDING", subscription: null } as never);
    const r = await checkSubscription("t@example.com", now);
    expect(r.active).toBe(false);
    expect(r).not.toHaveProperty("license");
    const call = findUnique.mock.calls.at(-1)?.[0] as { include: Record<string, unknown> };
    expect(Object.keys(call.include).sort()).toEqual(["gameStates", "subscription"]);
  });

  it("passes the trial flag through", async () => {
    findUnique.mockResolvedValue({ status: "PENDING", subscription: { active: false, trial: true, plan: "lifetime" } } as never);
    const r = await checkSubscription("a@example.com", now);
    expect(r.active).toBe(false);
    expect(r.trial).toBe(true);
  });
});

describe("checkSubscription — free-unlock test group", () => {
  beforeEach(() => vi.clearAllMocks());
  const base = { status: "PENDING", subscription: null };

  it("free group → course access via free-unlock, but not paid access", async () => {
    findUnique.mockResolvedValue({ ...base, gameStates: [{ state: { arm: "free", at: "2026-10-23" } }] } as never);
    const r = await checkSubscription("a@example.com", now);
    expect(r).toMatchObject({ active: true, via: "free-unlock" });
    expect(hasPaidAccess(r)).toBe(false);
  });

  it("paid group (control) → no access", async () => {
    findUnique.mockResolvedValue({ ...base, gameStates: [{ state: { arm: "paid" } }] } as never);
    expect((await checkSubscription("a@example.com", now)).active).toBe(false);
  });

  it("a free-group learner who bought shows as lifetime", async () => {
    findUnique.mockResolvedValue({ ...base, status: "ACTIVE", gameStates: [{ state: { arm: "free" } }] } as never);
    const r = await checkSubscription("a@example.com", now);
    expect(r.via).toBe("lifetime");
    expect(hasPaidAccess(r)).toBe(true);
  });
});
