import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  getLevelTitle,
  XP_REWARDS,
  LEVEL_THRESHOLDS,
} from "@/lib/gamification";

describe("calculateLevel", () => {
  it("returns level 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 2 for 200 XP", () => {
    expect(calculateLevel(200)).toBe(2);
  });

  it("returns level 3 for 500 XP", () => {
    expect(calculateLevel(500)).toBe(3);
  });

  it("returns level 4 for 1000 XP", () => {
    expect(calculateLevel(1000)).toBe(4);
  });

  it("returns level 7 for 5000+ XP", () => {
    expect(calculateLevel(9999)).toBe(7);
  });

  it("returns level 2 for 499 XP (just under level 3)", () => {
    expect(calculateLevel(499)).toBe(2);
  });
});

describe("getLevelTitle", () => {
  it("returns Volunteer Digger for level 1", () => {
    expect(getLevelTitle(1)).toBe("Volunteer Digger");
  });

  it("returns Master Egyptologist for level 7", () => {
    expect(getLevelTitle(7)).toBe("Master Egyptologist");
  });
});

describe("XP_REWARDS", () => {
  it("has expected reward values", () => {
    expect(XP_REWARDS).toEqual({
      conceptRead: 5,
      checkCorrect: 10,
      exerciseCorrect: 20,
      exerciseClean: 50,
      auditCorrect: 25,
      perfectAudit: 100,
    });
  });
});
