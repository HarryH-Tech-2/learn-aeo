import { describe, it, expect } from "vitest";
import { DAY_MS, MIN_EASE, daysUntilDue, dueSigns, fadeLevel, isDue, isSignState, qualityFor, review, seedSign, syncSigns, wallSummary } from "../srs";

const T0 = Date.UTC(2026, 8, 8);

describe("seeding", () => {
  it("a new sign is fresh and due in two days", () => {
    const s = seedSign("𓄿", T0);
    expect(s.due - T0).toBe(2 * DAY_MS);
    expect(fadeLevel(s, T0)).toBe(0);
    expect(isDue(s, T0)).toBe(false);
    expect(isDue(s, T0 + 2 * DAY_MS)).toBe(true);
    expect(daysUntilDue(s, T0)).toBe(2);
  });

  it("syncSigns adds only what is missing", () => {
    const a = [seedSign("𓄿", T0)];
    const b = syncSigns(a, ["𓄿", "𓅓"], T0 + 1000);
    expect(b.length).toBe(2);
    expect(b[0]).toBe(a[0]);
    expect(b[1].glyph).toBe("𓅓");
  });
});

describe("SM-2", () => {
  it("grows the interval 1, 6, then × ease on good answers", () => {
    let s = seedSign("𓄿", T0);
    s = review(s, 4, T0 + 2 * DAY_MS);
    expect(s.reps).toBe(1);
    expect(s.interval).toBe(1);
    expect(s.ease).toBe(2.5);
    s = review(s, 4, s.due);
    expect(s.interval).toBe(6);
    s = review(s, 4, s.due);
    expect(s.interval).toBe(15); // 6 × 2.5
    expect(s.due - s.lastReview).toBe(15 * DAY_MS);
  });

  it("a lapse resets to tomorrow, counts the lapse and lowers ease, never below the floor", () => {
    let s = seedSign("𓄿", T0);
    s = review(s, 5, T0);
    s = review(s, 5, s.due);
    s = review(s, 5, s.due);
    expect(s.ease).toBeGreaterThan(2.5);
    const before = s.ease;
    s = review(s, 1, s.due);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.interval).toBe(1);
    expect(s.ease).toBeLessThan(before);
    for (let i = 0; i < 20; i++) s = review(s, 0, s.due);
    expect(s.ease).toBe(MIN_EASE);
  });

  it("maps answers to grades", () => {
    expect(qualityFor(true, 1, 1500)).toBe(5);
    expect(qualityFor(true, 1, 8000)).toBe(4);
    expect(qualityFor(true, 1)).toBe(4);
    expect(qualityFor(true, 2)).toBe(3);
    expect(qualityFor(false, 1)).toBe(1);
  });
});

describe("fading", () => {
  it("fades linearly to 0.5 at the due date and 1 an interval later", () => {
    const s = seedSign("𓄿", T0);
    expect(fadeLevel(s, T0 + DAY_MS)).toBeCloseTo(0.25);
    expect(fadeLevel(s, T0 + 2 * DAY_MS)).toBeCloseTo(0.5);
    expect(fadeLevel(s, T0 + 4 * DAY_MS)).toBe(1);
    expect(fadeLevel(s, T0 + 40 * DAY_MS)).toBe(1);
  });

  it("lists due signs oldest first and summarises the wall", () => {
    const a = seedSign("𓄿", T0);
    const b = seedSign("𓅓", T0 - 5 * DAY_MS);
    const c = seedSign("𓏏", T0 - 3 * DAY_MS);
    const now = T0 + DAY_MS;
    expect(dueSigns([a, b, c], now).map((s) => s.glyph)).toEqual(["𓅓", "𓏏"]);
    const sum = wallSummary([a, b, c], now);
    expect(sum).toEqual({ total: 3, due: 2, fresh: 0, weathered: 2 });
    expect(isSignState(a)).toBe(true);
    expect(isSignState({ glyph: "x" })).toBe(false);
  });
});
