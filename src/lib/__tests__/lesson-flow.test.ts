import { describe, expect, it } from "vitest";
import { auditEventParams, buildSteps, clampResume, progressFraction, resumeKey, stepEventParams, stepToSave } from "../lesson-flow";
import type { Concept, LessonContent, Question } from "../lesson-types";

const concept = (id: string): Concept => ({ id, term: id, summary: "s", explanation: "e", whyItMatters: "w", pitfall: "p", sources: [] });
const q = (id: string): Question => ({ kind: "choice", id, prompt: "p", options: ["a", "b"], answer: 0, explanation: "e" });
const content: LessonContent = {
  intro: "i",
  outro: "o",
  groups: [
    { id: "g1", title: "G1", concepts: [concept("a"), concept("b")], check: [q("c1")] },
    { id: "g2", title: "G2", concepts: [concept("c")], check: [q("c2")] },
  ],
  exercise: { id: "ex", title: "t", brief: "b", steps: [q("e1"), q("e2")], debrief: "d" },
  example: { title: "t", context: "c", excerpt: { kind: "quote", text: "x" }, points: [], source: { title: "t", publisher: "p", url: "https://example.com", accessed: "2026-10-26" } },
  audit: [q("a1"), q("a2"), q("a3")],
};

describe("lesson flow", () => {
  const steps = buildSteps(content);
  const auditIndex = steps.findIndex((s) => s.kind === "audit");

  it("orders steps", () => {
    expect(steps).toEqual([
      { kind: "intro" },
      { kind: "concept", group: 0, concept: 0 },
      { kind: "concept", group: 0, concept: 1 },
      { kind: "check", group: 0 },
      { kind: "concept", group: 1, concept: 0 },
      { kind: "check", group: 1 },
      { kind: "exercise" },
      { kind: "example" },
      { kind: "audit" },
      { kind: "outro" },
    ]);
  });

  it("clamps resume", () => {
    expect(clampResume(3, steps)).toBe(3);
    expect(clampResume(99, steps)).toBe(auditIndex);
    expect(clampResume(steps.length - 1, steps)).toBe(auditIndex);
    expect(clampResume("2", steps)).toBe(0);
    expect(clampResume(-1, steps)).toBe(0);
    expect(clampResume(1.5, steps)).toBe(0);
    expect(clampResume(NaN, steps)).toBe(0);
    expect(clampResume(null, steps)).toBe(0);
  });

  it("keys and progress", () => {
    expect(resumeKey("x")).toBe("aeo_lesson_x");
    expect(progressFraction(0, steps)).toBe(0);
    expect(progressFraction(steps.length - 1, steps)).toBe(1);
    expect(progressFraction(-5, steps)).toBe(0);
    expect(progressFraction(999, steps)).toBe(1);
  });

  it("clears the saved step once the audit is passed, and keeps it otherwise", () => {
    expect(stepToSave(3, false)).toBe(3);
    expect(stepToSave(auditIndex, false)).toBe(auditIndex);
    // passed: nothing is saved, so reopening (or reloading on the outro) starts at the intro
    expect(stepToSave(steps.length - 1, true)).toBeNull();
    expect(stepToSave(2, true)).toBeNull();
    // a failed audit still resumes at the audit, never past it
    expect(clampResume(stepToSave(steps.length - 1, false), steps)).toBe(auditIndex);
  });

  it("lesson events carry lesson_id", () => {
    expect(stepEventParams("the-gate", steps[0])).toEqual({ lesson_id: "the-gate", step_kind: "intro" });
    expect(stepEventParams("the-gate", undefined)).toEqual({ lesson_id: "the-gate", step_kind: undefined });
    expect(auditEventParams("the-gate", 8, 10, true)).toEqual({ lesson_id: "the-gate", score: 8, total: 10, passed: 1 });
    expect(auditEventParams("the-gate", 3, 10, false)).toEqual({ lesson_id: "the-gate", score: 3, total: 10, passed: 0 });
  });
});
