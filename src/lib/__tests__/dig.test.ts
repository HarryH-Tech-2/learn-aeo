import { describe, it, expect } from "vitest";
import { PLAN, chamberPosition, computeChambers, computeSideRooms, digSummary, nextLessonId, sideRoomPosition } from "../dig";
import { GAMES } from "../games";

const guest = { signedIn: false, paid: false };
const member = { signedIn: true, paid: false };
const paid = { signedIn: true, paid: true };

describe("chamber states", () => {
  it("guest: chamber 1 open, everything else sealed behind sign-in", () => {
    const ch = computeChambers(guest, null);
    expect(ch.length).toBe(8);
    expect(ch[0].state).toBe("open");
    expect(ch[0].href).toBe("/lessons/expedition-begins");
    for (const c of ch.slice(1)) {
      expect(c.state).toBe("sealed");
      expect(c.seal).toBe("signin");
      expect(c.href).toMatch(/^\/lessons\//);
    }
  });

  it("signed-in, unpaid, lesson 1 done: paywall on chamber 2 only", () => {
    const ch = computeChambers(member, { "expedition-begins": { started: true, bestScore: 9, completed: true } });
    expect(ch[0].state).toBe("cleared");
    expect(ch[0].bestScore).toBe(9);
    expect(ch[1].state).toBe("sealed");
    expect(ch[1].seal).toBe("paywall");
    expect(ch[1].href).toBe("/checkout");
    expect(ch[2].state).toBe("unexcavated");
  });

  it("paid, three cleared: chamber 4 open, rest unexcavated but enterable", () => {
    const done = { started: true, bestScore: 8, completed: true };
    const ch = computeChambers(paid, { "expedition-begins": done, "outer-courtyard": done, "pilgrims-gallery": done });
    expect(ch.map((c) => c.state)).toEqual(["cleared", "cleared", "cleared", "open", "unexcavated", "unexcavated", "unexcavated", "unexcavated"]);
    expect(ch[7].href).toBe("/lessons/inner-sanctum");
    const s = digSummary(ch);
    expect(s).toMatchObject({ cleared: 3, total: 8, deepest: 3 });
    expect(s.next?.id).toBe("the-treasury");
  });

  it("all cleared: nothing open, next is null", () => {
    const done = { started: true, bestScore: 10, completed: true };
    const all = Object.fromEntries(computeChambers(paid, null).map((c) => [c.id, done]));
    const ch = computeChambers(paid, all);
    expect(ch.every((c) => c.state === "cleared")).toBe(true);
    expect(digSummary(ch).next).toBeNull();
    expect(nextLessonId(all)).toBe("inner-sanctum");
  });

  it("attaches the games that practise each chamber's signs", () => {
    const ch = computeChambers(guest, null);
    expect(ch[0].games.map((g) => g.id)).toContain("daily");
    expect(ch[4].games.map((g) => g.id)).toContain("decipher");
  });
});

describe("layout", () => {
  it("places every chamber and side room inside the plan, without overlap", () => {
    const rooms = [...computeChambers(paid, null).map((c) => ({ x: c.x, y: c.y })), ...computeSideRooms(paid).map((r) => ({ x: r.x, y: r.y }))];
    for (const r of rooms) {
      expect(r.x).toBeGreaterThan(0);
      expect(r.x).toBeLessThan(PLAN.width);
      expect(r.y).toBeGreaterThan(0);
      expect(r.y).toBeLessThan(PLAN.height);
    }
    for (let i = 0; i < rooms.length; i++)
      for (let j = i + 1; j < rooms.length; j++) {
        const d = Math.hypot(rooms[i].x - rooms[j].x, rooms[i].y - rooms[j].y);
        expect(d, `rooms ${i} and ${j}`).toBeGreaterThan(70);
      }
  });

  it("serpentine path turns after chamber 4", () => {
    expect(chamberPosition(1).x).toBeLessThan(chamberPosition(4).x);
    expect(chamberPosition(5).x).toBeLessThan(chamberPosition(4).x);
    expect(chamberPosition(8).y).toBeGreaterThan(chamberPosition(7).y);
    expect(sideRoomPosition(1, 0).y).toBeLessThan(chamberPosition(1).y);
    expect(sideRoomPosition(1, 1).x).toBeGreaterThan(sideRoomPosition(1, 0).x);
  });

  it("side rooms open by free flag or purchase", () => {
    const g = computeSideRooms(guest);
    expect(g.find((r) => r.game.id === "daily")?.open).toBe(true);
    expect(g.find((r) => r.game.id === "sign-hunt")?.open).toBe(false);
    expect(computeSideRooms(paid).every((r) => r.open)).toBe(true);
    expect(g.length).toBe(GAMES.length);
  });
});
