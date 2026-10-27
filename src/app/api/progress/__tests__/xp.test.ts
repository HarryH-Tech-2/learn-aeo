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

// An in-memory stand-in for the tables recordXP touches, so the real award rules run.
const db = vi.hoisted(() => {
  type Claim = { id: string; userId: string; lessonId: string; key: string; xp: number };
  const state = {
    claims: new Map<string, Claim>(),
    users: new Map<string, { id: string; xp: number; level: number }>(),
    progressXp: new Map<string, number>(),
    nextId: 1,
  };
  const ck = (w: { userId: string; lessonId: string; key: string }) => `${w.userId}|${w.lessonId}|${w.key}`;
  const prisma = {
    xpClaim: {
      findUnique: vi.fn(async ({ where }: { where: { userId_lessonId_key: { userId: string; lessonId: string; key: string } } }) => {
        const c = state.claims.get(ck(where.userId_lessonId_key));
        return c ? { ...c } : null;
      }),
      create: vi.fn(async ({ data }: { data: Omit<Claim, "id"> }) => {
        if (state.claims.has(ck(data))) throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
        const c = { id: `c${state.nextId++}`, ...data };
        state.claims.set(ck(data), c);
        return { ...c };
      }),
      updateMany: vi.fn(async ({ where, data }: { where: { id: string; xp: number }; data: { xp: number } }) => {
        for (const c of state.claims.values()) {
          if (c.id === where.id && c.xp === where.xp) {
            c.xp = data.xp;
            return { count: 1 };
          }
        }
        return { count: 0 };
      }),
    },
    lessonProgress: {
      upsert: vi.fn(
        async ({ where, update, create }: {
          where: { userId_lessonId: { userId: string; lessonId: string } };
          update: { xpEarned: { increment: number } };
          create: { xpEarned: number };
        }) => {
          const k = `${where.userId_lessonId.userId}|${where.userId_lessonId.lessonId}`;
          const had = state.progressXp.get(k);
          state.progressXp.set(k, had === undefined ? create.xpEarned : had + update.xpEarned.increment);
          return {};
        }
      ),
    },
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        const u = state.users.get(where.id);
        return u ? { ...u } : null;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: { xp?: { increment: number }; level?: number } }) => {
        const u = state.users.get(where.id)!;
        if (data.xp) u.xp += data.xp.increment;
        if (data.level !== undefined) u.level = data.level;
        return { ...u };
      }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
  };
  return { state, prisma };
});

vi.mock("@/lib/db", () => ({ prisma: db.prisma }));

import { POST } from "@/app/api/progress/xp/route";
import { getServerSession } from "next-auth";
import { checkSubscription } from "@/lib/subscription";
import { XP_REWARDS } from "@/lib/gamification";

const mockedSession = vi.mocked(getServerSession);
const mockedCheck = vi.mocked(checkSubscription);

const FREE_ID = "how-answer-engines-choose-sources"; // lesson 1: 10 audit questions
const PAID_ID = "make-your-site-reachable-by-ai"; // lesson 2: live, paid
const SOON_ID = "structured-data-and-entities";

async function post(body: Record<string, unknown>) {
  const res = await POST(
    new Request("http://localhost:3000/api/progress/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  return { status: res.status, json: (await res.json()) as { awarded?: number; totalXP?: number; newLevel?: number } };
}

describe("POST /api/progress/xp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.state.claims.clear();
    db.state.progressXp.clear();
    db.state.users.clear();
    db.state.users.set("u1", { id: "u1", xp: 0, level: 1 });
    mockedSession.mockResolvedValue({ user: { id: "u1", email: "learner@example.com" } });
    mockedCheck.mockResolvedValue({ active: false, trial: false, via: null, periodEnd: null });
  });

  it("returns 401 when signed out", async () => {
    mockedSession.mockResolvedValue(null);
    expect((await post({ lessonId: FREE_ID, key: "check:q-g1-mention" })).status).toBe(401);
    expect(db.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("pays a check once: the duplicate claim awards 0", async () => {
    const first = await post({ lessonId: FREE_ID, key: "check:q-g1-mention" });
    expect(first.status).toBe(200);
    expect(first.json).toEqual({ awarded: XP_REWARDS.checkCorrect, totalXP: 10, newLevel: 1 });
    const second = await post({ lessonId: FREE_ID, key: "check:q-g1-mention" });
    expect(second.status).toBe(200);
    expect(second.json).toEqual({ awarded: 0, totalXP: 10, newLevel: 1 });
    expect(db.state.users.get("u1")!.xp).toBe(10);
    expect(db.state.progressXp.get(`u1|${FREE_ID}`)).toBe(10);
  });

  it("allows the free lesson for any signed-in user without a subscription check", async () => {
    expect((await post({ lessonId: FREE_ID, key: "concept:c-answer-engine" })).json.awarded).toBe(XP_REWARDS.conceptRead);
    expect(mockedCheck).not.toHaveBeenCalled();
  });

  it("audit 6 then 9 awards 150 then 75", async () => {
    expect((await post({ lessonId: FREE_ID, key: "audit", auditScore: 6 })).json.awarded).toBe(150);
    expect((await post({ lessonId: FREE_ID, key: "audit", auditScore: 9 })).json.awarded).toBe(75);
    expect(db.state.users.get("u1")!.xp).toBe(225);
  });

  it("audit 9 then 6 awards 225 then 0", async () => {
    expect((await post({ lessonId: FREE_ID, key: "audit", auditScore: 9 })).json.awarded).toBe(225);
    expect((await post({ lessonId: FREE_ID, key: "audit", auditScore: 6 })).json.awarded).toBe(0);
    expect(db.state.users.get("u1")!.xp).toBe(225);
  });

  it("a perfect retake adds the difference plus the bonus, once", async () => {
    expect((await post({ lessonId: FREE_ID, key: "audit", auditScore: 9 })).json.awarded).toBe(225);
    const perfect = await post({ lessonId: FREE_ID, key: "audit", auditScore: 10 });
    expect(perfect.json).toEqual({ awarded: 125, totalXP: 350, newLevel: 2 });
    expect((await post({ lessonId: FREE_ID, key: "audit", auditScore: 10 })).json.awarded).toBe(0);
    expect(db.state.users.get("u1")).toMatchObject({ xp: 350, level: 2 });
  });

  it("counts a unique-constraint race on create as already claimed", async () => {
    // Another request creates the claim between our read and our create, every time.
    const realCreate = db.prisma.xpClaim.create.getMockImplementation()!;
    db.prisma.xpClaim.create.mockImplementation(async () => {
      throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    });
    const res = await post({ lessonId: FREE_ID, key: "check:q-g1-mention" }).finally(() =>
      db.prisma.xpClaim.create.mockImplementation(realCreate)
    );
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ awarded: 0, totalXP: 0, newLevel: 1 });
    expect(db.state.users.get("u1")!.xp).toBe(0);
    expect(db.prisma.lessonProgress.upsert).not.toHaveBeenCalled();
  });

  it("refuses a paid lesson without access (403)", async () => {
    const res = await post({ lessonId: PAID_ID, key: "audit", auditScore: 5 });
    expect(res.status).toBe(403);
    expect(mockedCheck).toHaveBeenCalledWith("learner@example.com");
    expect(db.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("pays a paid lesson for a learner with access", async () => {
    mockedCheck.mockResolvedValue({ active: true, trial: false, via: "lifetime", periodEnd: null });
    const res = await post({ lessonId: PAID_ID, key: "audit", auditScore: 5 });
    expect(res.status).toBe(200);
    expect(res.json.awarded).toBe(5 * XP_REWARDS.auditCorrect);
  });

  it.each([
    ["a coming-soon lesson", { lessonId: SOON_ID, key: "audit", auditScore: 5 }],
    ["an unknown lesson", { lessonId: "not-a-lesson", key: "audit", auditScore: 5 }],
    ["a bogus key", { lessonId: FREE_ID, key: "bogus" }],
    ["a key from another lesson", { lessonId: FREE_ID, key: "check:not-in-lesson-1" }],
    ["an audit score above the audit length", { lessonId: FREE_ID, key: "audit", auditScore: 11 }],
    ["an audit without a score", { lessonId: FREE_ID, key: "audit" }],
    ["the old amount-only body", { lessonId: FREE_ID, xp: 10 }],
  ])("rejects %s (400)", async (_label, body) => {
    expect((await post(body)).status).toBe(400);
    expect(db.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a malformed JSON body (400)", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/progress/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      })
    );
    expect(res.status).toBe(400);
  });
});
