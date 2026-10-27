// Lesson step sequencing and resume handling: turns lesson content into a flat
// list of steps, and sanitises a saved position so a reload never lands past
// the audit or on a corrupt value.

import { COOKIE_PREFIX } from "@/lib/site";
import type { LessonContent } from "./lesson-types";

export type Step =
  | { kind: "intro" }
  | { kind: "concept"; group: number; concept: number }
  | { kind: "check"; group: number }
  | { kind: "exercise" }
  | { kind: "example" }
  | { kind: "audit" }
  | { kind: "outro" };

export function buildSteps(content: LessonContent): Step[] {
  const steps: Step[] = [{ kind: "intro" }];
  content.groups.forEach((g, group) => {
    g.concepts.forEach((_, concept) => steps.push({ kind: "concept", group, concept }));
    steps.push({ kind: "check", group });
  });
  steps.push({ kind: "exercise" }, { kind: "example" }, { kind: "audit" }, { kind: "outro" });
  return steps;
}

/** A saved step index, limited to 0..audit. Anything that is not an integer gives 0. */
export function clampResume(saved: unknown, steps: Step[]): number {
  if (typeof saved !== "number" || !Number.isInteger(saved) || saved < 0) return 0;
  const audit = steps.findIndex((s) => s.kind === "audit");
  const max = audit >= 0 ? audit : steps.length - 1;
  return Math.min(saved, Math.max(max, 0));
}

export function resumeKey(lessonId: string): string {
  return `${COOKIE_PREFIX}lesson_${lessonId}`;
}

export function progressFraction(index: number, steps: Step[]): number {
  if (steps.length <= 1) return 0;
  return Math.min(1, Math.max(0, index / (steps.length - 1)));
}

/**
 * The step to save for resuming, or null to clear the saved step. Once the
 * audit is passed the lesson is finished, so nothing is saved and reopening it
 * (or reloading on the outro) starts at the intro. Until then the current step
 * is saved, and clampResume brings a saved outro back to the audit.
 */
export function stepToSave(index: number, auditPassed: boolean): number | null {
  return auditPassed ? null : index;
}

/** Params for the lesson_step event. */
export function stepEventParams(lessonId: string, step: Step | undefined) {
  return { lesson_id: lessonId, step_kind: step?.kind };
}

/** Params for the lesson_audit_complete event. */
export function auditEventParams(lessonId: string, score: number, total: number, passed: boolean) {
  return { lesson_id: lessonId, score, total, passed: passed ? 1 : 0 };
}
