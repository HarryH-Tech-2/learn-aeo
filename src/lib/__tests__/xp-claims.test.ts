import { describe, it, expect } from "vitest";
import { xpForClaim } from "@/lib/xp-claims";
import { XP_REWARDS } from "@/lib/gamification";
import type { LessonContent, Question, Concept } from "@/lib/lesson-types";

const q = (id: string): Question => ({
  kind: "choice",
  id,
  prompt: "p",
  options: ["a", "b"],
  answer: 0,
  explanation: "e",
});

const concept = (id: string): Concept => ({
  id,
  term: "t",
  summary: "s",
  explanation: "e",
  whyItMatters: "w",
  pitfall: "p",
  sources: [],
});

const LESSON: LessonContent = {
  intro: "i",
  outro: "o",
  groups: [
    { id: "g1", title: "G1", concepts: [concept("c-a"), concept("c-b")], check: [q("q-1"), q("q-2")] },
    { id: "g2", title: "G2", concepts: [concept("c-c")], check: [q("q-3")] },
  ],
  exercise: { id: "x-ex", title: "X", brief: "b", steps: [q("x-1"), q("x-2")], debrief: "d" },
  example: {
    title: "t",
    context: "c",
    excerpt: { kind: "quote", text: "q" },
    points: [],
    source: { title: "s", publisher: "p", url: "https://example.com", accessed: "2026-10-27" },
  },
  audit: Array.from({ length: 10 }, (_, i) => q(`a-${i}`)),
};

describe("xpForClaim", () => {
  it("prices each key kind from XP_REWARDS", () => {
    expect(xpForClaim(LESSON, "concept:c-a")).toBe(XP_REWARDS.conceptRead);
    expect(xpForClaim(LESSON, "concept:c-c")).toBe(XP_REWARDS.conceptRead);
    expect(xpForClaim(LESSON, "check:q-3")).toBe(XP_REWARDS.checkCorrect);
    expect(xpForClaim(LESSON, "exercise:x-ex:x-2")).toBe(XP_REWARDS.exerciseCorrect);
    expect(xpForClaim(LESSON, "exercise:x-ex:clean")).toBe(XP_REWARDS.exerciseClean);
  });

  it.each([
    "concept:c-zzz",
    "check:q-zzz",
    "check:x-1", // an exercise step is not a quick check
    "check:a-0", // nor is an audit question
    "exercise:x-ex:q-1", // a check question is not an exercise step
    "exercise:x-other:x-1",
    "exercise:x-other:clean",
    "exercise:x-ex",
    "concept:",
    "q:q-1",
    "bogus",
    "",
  ])("returns null for %j, which is not in the lesson", (key) => {
    expect(xpForClaim(LESSON, key)).toBeNull();
  });

  it("prices the audit by score, with the perfect bonus only for a full score", () => {
    expect(xpForClaim(LESSON, "audit", 8)).toBe(200);
    expect(xpForClaim(LESSON, "audit", 10)).toBe(350);
    expect(xpForClaim(LESSON, "audit", 0)).toBe(0);
  });

  it.each([
    ["11/10", 11],
    ["2.5", 2.5],
    ["missing", undefined],
    ["negative", -1],
    ["NaN", Number.NaN],
  ])("returns null for an audit score that is %s", (_label, score) => {
    expect(xpForClaim(LESSON, "audit", score)).toBeNull();
  });
});
