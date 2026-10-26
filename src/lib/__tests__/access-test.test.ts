import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { gameState: { upsert: vi.fn() } } }));

import { prisma } from "@/lib/db";
import { accessTestPercent, armOf, assignAccessTest, pickArm, pickVisitorArm, summariseAccessTest } from "@/lib/access-test";

const upsert = vi.mocked(prisma.gameState.upsert);

describe("accessTestPercent", () => {
  it("is 0 (off) when unset, blank, negative or not a number", () => {
    expect(accessTestPercent({})).toBe(0);
    expect(accessTestPercent({ ACCESS_TEST_FREE_PERCENT: "" })).toBe(0);
    expect(accessTestPercent({ ACCESS_TEST_FREE_PERCENT: "-5" })).toBe(0);
    expect(accessTestPercent({ ACCESS_TEST_FREE_PERCENT: "lots" })).toBe(0);
  });
  it("reads the share and caps it at 100", () => {
    expect(accessTestPercent({ ACCESS_TEST_FREE_PERCENT: "20" })).toBe(20);
    expect(accessTestPercent({ ACCESS_TEST_FREE_PERCENT: "150" })).toBe(100);
  });
});

describe("pickArm", () => {
  it("assigns nobody while off", () => expect(pickArm(0.01, 0)).toBeNull());
  it("splits at the percentage", () => {
    expect(pickArm(0.19, 20)).toBe("free");
    expect(pickArm(0.2, 20)).toBe("paid");
    expect(pickArm(0.99, 20)).toBe("paid");
  });
});

describe("armOf", () => {
  it("reads only known groups", () => {
    expect(armOf({ arm: "free" })).toBe("free");
    expect(armOf({ arm: "paid" })).toBe("paid");
    expect(armOf({ arm: "other" })).toBeNull();
    expect(armOf(null)).toBeNull();
  });
});

describe("assignAccessTest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ACCESS_TEST_FREE_PERCENT;
  });

  it("writes nothing while the test is off", async () => {
    expect(await assignAccessTest("u1", null, 0.01)).toBeNull();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("stores the group once and never overwrites it", async () => {
    process.env.ACCESS_TEST_FREE_PERCENT = "20";
    expect(await assignAccessTest("u1", null, 0.05)).toBe("free");
    const arg = upsert.mock.calls[0][0] as unknown as { where: unknown; create: { state: { arm: string } }; update: unknown };
    expect(arg.where).toEqual({ userId_game: { userId: "u1", game: "access-test" } });
    expect(arg.create.state.arm).toBe("free");
    expect(arg.update).toEqual({});
  });

  it("takes the group the visitor was shown, even with the test switched off", async () => {
    expect(await assignAccessTest("u1", "free", 0.99)).toBe("free");
    expect((upsert.mock.calls[0][0] as unknown as { create: { state: { arm: string } } }).create.state.arm).toBe("free");
    expect(await assignAccessTest("u2", "paid", 0.01)).toBe("paid");
  });

  it("ignores a cookie that is not a group", async () => {
    expect(await assignAccessTest("u1", "gold", 0.01)).toBeNull();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("never throws if the database fails", async () => {
    process.env.ACCESS_TEST_FREE_PERCENT = "20";
    upsert.mockRejectedValueOnce(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await assignAccessTest("u1", null, 0.5)).toBeNull();
  });
});

describe("summariseAccessTest", () => {
  it("counts each group", () => {
    const p = (arm: "free" | "paid", over = {}) => ({ arm, email: "x@example.com", started: false, lesson1Done: false, pastLesson1: false, paid: false, ...over });
    const [free, paid] = summariseAccessTest([p("free", { started: true, pastLesson1: true }), p("free"), p("paid", { started: true, lesson1Done: true, paid: true })]);
    expect(free).toEqual({ arm: "free", accounts: 2, started: 1, lesson1Done: 0, pastLesson1: 1, paid: 0 });
    expect(paid).toEqual({ arm: "paid", accounts: 1, started: 1, lesson1Done: 1, pastLesson1: 0, paid: 1 });
  });
});

describe("pickVisitorArm", () => {
  const chrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0";
  it("keeps the cookie's group", () => {
    expect(pickVisitorArm({ cookie: "free", userAgent: chrome, percent: 0 })).toEqual({ arm: "free", set: false });
  });
  it("gives a new visitor a group while the test is on", () => {
    expect(pickVisitorArm({ cookie: null, userAgent: chrome, percent: 20 }, () => 0.1)).toEqual({ arm: "free", set: true });
    expect(pickVisitorArm({ cookie: undefined, userAgent: chrome, percent: 20 }, () => 0.5)).toEqual({ arm: "paid", set: true });
  });
  it("gives nobody a group while off, and crawlers none", () => {
    expect(pickVisitorArm({ cookie: null, userAgent: chrome, percent: 0 })).toEqual({ arm: null, set: false });
    expect(pickVisitorArm({ cookie: null, userAgent: "Googlebot/2.1", percent: 20 })).toEqual({ arm: null, set: false });
  });
});
