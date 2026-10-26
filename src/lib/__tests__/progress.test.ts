import { describe, it, expect, vi, beforeEach } from "vitest";
import { shouldIncrementStreak, isLessonComplete } from "@/lib/progress";

describe("isLessonComplete", () => {
  it("returns true when score is 3 out of 5", () => {
    expect(isLessonComplete(3, 5)).toBe(true);
  });

  it("returns true when score is 5 out of 5", () => {
    expect(isLessonComplete(5, 5)).toBe(true);
  });

  it("returns false when score is 2 out of 5", () => {
    expect(isLessonComplete(2, 5)).toBe(false);
  });

  it("returns false when score is 0", () => {
    expect(isLessonComplete(0, 5)).toBe(false);
  });
});

describe("shouldIncrementStreak", () => {
  it("returns true when lastActiveDate is null (first activity ever)", () => {
    expect(shouldIncrementStreak(null, new Date("2026-04-02"))).toBe(true);
  });

  it("returns true when lastActiveDate was yesterday", () => {
    expect(
      shouldIncrementStreak(
        new Date("2026-04-01"),
        new Date("2026-04-02")
      )
    ).toBe(true);
  });

  it("returns false when lastActiveDate is today (already counted)", () => {
    expect(
      shouldIncrementStreak(
        new Date("2026-04-02"),
        new Date("2026-04-02")
      )
    ).toBe(false);
  });

  it("returns 'reset' when lastActiveDate was more than 1 day ago", () => {
    expect(
      shouldIncrementStreak(
        new Date("2026-03-30"),
        new Date("2026-04-02")
      )
    ).toBe("reset");
  });
});
