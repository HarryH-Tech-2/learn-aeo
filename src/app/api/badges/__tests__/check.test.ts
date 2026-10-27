import { describe, it, expect, vi, beforeEach } from "vitest";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const db = vi.hoisted(() => ({
  progress: [] as { started: boolean; completed: boolean }[],
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

const nameOf = (criteria: string) => BADGE_DEFINITIONS.find((b) => b.criteria === criteria)!.name;

async function check(body: { lessonId: string; score: number; total: number }) {
  const res = await POST(
    new Request("http://localhost/api/badges/check", { method: "POST", body: JSON.stringify(body) })
  );
  return (await res.json()) as { awarded: string[] };
}

const rows = (started: number, completed: number) =>
  Array.from({ length: started }, (_, i) => ({ started: true, completed: i < completed }));

describe("POST /api/badges/check", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    db.progress = [];
    db.streak = null;
  });

  it("awards the district badge and Perfect Audit for a perfect audit", async () => {
    const { awarded } = await check({ lessonId: "make-your-site-reachable-by-ai", score: 10, total: 10 });
    expect(awarded).toContain("Dockmaster");
    expect(awarded).toContain(nameOf("perfect-audit"));
  });

  it("does not award Perfect Audit for a non-perfect score", async () => {
    const { awarded } = await check({ lessonId: "make-your-site-reachable-by-ai", score: 9, total: 10 });
    expect(awarded).toContain("Dockmaster");
    expect(awarded).not.toContain(nameOf("perfect-audit"));
  });

  it("fires first-lesson at one started lesson", async () => {
    db.progress = rows(1, 0);
    const { awarded } = await check({ lessonId: "x", score: 0, total: 10 });
    expect(awarded).toEqual([nameOf("milestone:first-lesson")]);
  });

  it("fires half-city at 4 completed districts, not 3", async () => {
    db.progress = rows(4, 3);
    expect((await check({ lessonId: "x", score: 0, total: 10 })).awarded).not.toContain(nameOf("milestone:half-city"));
    db.progress = rows(4, 4);
    expect((await check({ lessonId: "x", score: 0, total: 10 })).awarded).toContain(nameOf("milestone:half-city"));
  });

  it("fires all-districts at 8 completed districts, not 7", async () => {
    db.progress = rows(8, 7);
    expect((await check({ lessonId: "x", score: 0, total: 10 })).awarded).not.toContain(
      nameOf("milestone:all-districts")
    );
    db.progress = rows(8, 8);
    const { awarded } = await check({ lessonId: "x", score: 0, total: 10 });
    expect(awarded).toContain(nameOf("milestone:all-districts"));
    expect(awarded).toContain(nameOf("milestone:half-city"));
  });

  it("returns 401 without a session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null as never);
    const res = await POST(new Request("http://localhost/api/badges/check", { method: "POST", body: "{}" }));
    expect(res.status).toBe(401);
  });
});
