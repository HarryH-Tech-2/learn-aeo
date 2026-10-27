import { describe, it, expect, vi, beforeEach } from "vitest";
import { BADGE_DEFINITIONS } from "@/lib/gamification";
import { LESSONS, isLive, type LiveLesson } from "@/lib/lessons";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/subscription", () => ({ checkSubscription: vi.fn() }));

type Row = { lessonId: string; started: boolean; completed: boolean; bestScore: number | null };

const db = vi.hoisted(() => ({
  progress: [] as Row[],
  streak: null as { currentStreak: number } | null,
}));

vi.mock("@/lib/db", async () => {
  const { BADGE_DEFINITIONS } = await import("@/lib/gamification");
  const badges = BADGE_DEFINITIONS.map((b, i) => ({ id: `b${i}`, name: b.name, criteria: b.criteria }));
  return {
    prisma: {
      badge: {
        findFirst: vi.fn(async ({ where }: { where: { criteria: string } }) =>
          badges.find((b) => b.criteria === where.criteria) ?? null
        ),
      },
      userBadge: { findUnique: vi.fn(async () => null), create: vi.fn(async () => ({})) },
      userStreak: { findUnique: vi.fn(async () => db.streak) },
      lessonProgress: { findMany: vi.fn(async () => db.progress) },
    },
  };
});

import { POST } from "@/app/api/badges/check/route";
import { getServerSession } from "next-auth";
import { checkSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/db";

const nameOf = (criteria: string) => BADGE_DEFINITIONS.find((b) => b.criteria === criteria)!.name;

const live = LESSONS.filter(isLive) as LiveLesson[];
const FREE = live.find((l) => l.isFree)!;
const PAID = live.find((l) => !l.isFree)!;
const SOON = LESSONS.find((l) => l.status === "coming-soon")!;
const FREE_TOTAL = FREE.content.audit.length;
const PAID_TOTAL = PAID.content.audit.length;

async function post(body: unknown) {
  return POST(new Request("http://localhost/api/badges/check", { method: "POST", body: JSON.stringify(body) }));
}

async function check(body: { lessonId: string; score: number; total: number }) {
  const res = await post(body);
  expect(res.status).toBe(200);
  return (await res.json()) as { awarded: string[] };
}

const row = (lessonId: string, bestScore: number | null, completed: boolean): Row => ({
  lessonId,
  started: true,
  completed,
  bestScore,
});

// Other lessons' rows for the milestone counts.
const others = (started: number, completed: number) =>
  Array.from({ length: started }, (_, i) => row(`other-${i}`, 0, i < completed));

describe("POST /api/badges/check", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", email: "u1@example.com" } } as never);
    vi.mocked(checkSubscription).mockResolvedValue({ active: true } as never);
    vi.mocked(prisma.userBadge.create).mockClear();
    db.progress = [];
    db.streak = null;
  });

  it("awards the district badge and Perfect Audit for a stored perfect audit", async () => {
    db.progress = [row(PAID.id, PAID_TOTAL, true)];
    const { awarded } = await check({ lessonId: PAID.id, score: PAID_TOTAL, total: PAID_TOTAL });
    expect(awarded).toContain(nameOf(`complete:${PAID.id}`));
    expect(awarded).toContain(nameOf("perfect-audit"));
  });

  it("does not award Perfect Audit when the stored best is not perfect", async () => {
    db.progress = [row(PAID.id, PAID_TOTAL - 1, true)];
    const { awarded } = await check({ lessonId: PAID.id, score: PAID_TOTAL - 1, total: PAID_TOTAL });
    expect(awarded).toContain(nameOf(`complete:${PAID.id}`));
    expect(awarded).not.toContain(nameOf("perfect-audit"));
  });

  it("bases the district and Perfect Audit badges on stored progress, not the numbers sent", async () => {
    // A valid-looking perfect score with nothing stored for the lesson earns neither.
    const { awarded } = await check({ lessonId: FREE.id, score: FREE_TOTAL, total: FREE_TOTAL });
    expect(awarded).not.toContain(nameOf(`complete:${FREE.id}`));
    expect(awarded).not.toContain(nameOf("perfect-audit"));
  });

  it.each([
    ["a total that is not the audit length", { score: 3, total: 3 }],
    ["a score above the total", { score: FREE_TOTAL + 1, total: FREE_TOTAL }],
    ["a negative score", { score: -1, total: FREE_TOTAL }],
    ["a fractional score", { score: 1.5, total: FREE_TOTAL }],
    ["a string score", { score: String(FREE_TOTAL), total: FREE_TOTAL }],
  ])("rejects %s with 400 and awards nothing", async (_label, nums) => {
    db.progress = [row(FREE.id, FREE_TOTAL, true)];
    const res = await post({ lessonId: FREE.id, ...nums });
    expect(res.status).toBe(400);
    expect(prisma.userBadge.create).not.toHaveBeenCalled();
  });

  it("rejects a coming-soon lesson with 400", async () => {
    const res = await post({ lessonId: SOON.id, score: 0, total: 10 });
    expect(res.status).toBe(400);
    expect(prisma.userBadge.create).not.toHaveBeenCalled();
  });

  it("rejects an unknown lesson with 400", async () => {
    const res = await post({ lessonId: "x", score: 0, total: 10 });
    expect(res.status).toBe(400);
  });

  it("rejects a paid lesson without access with 403 and awards nothing", async () => {
    vi.mocked(checkSubscription).mockResolvedValue({ active: false } as never);
    db.progress = [row(PAID.id, PAID_TOTAL, true)];
    const res = await post({ lessonId: PAID.id, score: PAID_TOTAL, total: PAID_TOTAL });
    expect(res.status).toBe(403);
    expect(prisma.userBadge.create).not.toHaveBeenCalled();
  });

  it("lets the free lesson through without access", async () => {
    vi.mocked(checkSubscription).mockResolvedValue({ active: false } as never);
    db.progress = [row(FREE.id, FREE_TOTAL, true)];
    const { awarded } = await check({ lessonId: FREE.id, score: FREE_TOTAL, total: FREE_TOTAL });
    expect(awarded).toContain(nameOf(`complete:${FREE.id}`));
  });

  it("fires first-lesson at one started lesson", async () => {
    db.progress = others(1, 0);
    const { awarded } = await check({ lessonId: FREE.id, score: 0, total: FREE_TOTAL });
    expect(awarded).toEqual([nameOf("milestone:first-lesson")]);
  });

  it("fires half-city at 4 completed districts, not 3", async () => {
    db.progress = others(4, 3);
    expect((await check({ lessonId: FREE.id, score: 0, total: FREE_TOTAL })).awarded).not.toContain(
      nameOf("milestone:half-city")
    );
    db.progress = others(4, 4);
    expect((await check({ lessonId: FREE.id, score: 0, total: FREE_TOTAL })).awarded).toContain(
      nameOf("milestone:half-city")
    );
  });

  it("fires all-districts at 8 completed districts, not 7", async () => {
    db.progress = others(8, 7);
    expect((await check({ lessonId: FREE.id, score: 0, total: FREE_TOTAL })).awarded).not.toContain(
      nameOf("milestone:all-districts")
    );
    db.progress = others(8, 8);
    const { awarded } = await check({ lessonId: FREE.id, score: 0, total: FREE_TOTAL });
    expect(awarded).toContain(nameOf("milestone:all-districts"));
    expect(awarded).toContain(nameOf("milestone:half-city"));
  });

  it("returns 401 without a session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as never);
    const res = await POST(new Request("http://localhost/api/badges/check", { method: "POST", body: "{}" }));
    expect(res.status).toBe(401);
  });
});
