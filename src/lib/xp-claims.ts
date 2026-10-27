// XP claim keys and what each is worth. Pure (no Prisma), so the lesson player
// and the /api/progress/xp route share one definition of the keys.
//
// A key names one XP-earning step of a lesson. The server pays a key once per
// user and lesson (XpClaim rows); the `audit` key is the exception, paying the
// gain over the best audit value so far.

import type { LessonContent } from "./lesson-types";
import { XP_REWARDS } from "./gamification";

/** What the player sends for one step: the key, plus the score for `audit`. */
export type XpClaim = { key: string; auditScore?: number };

export const AUDIT_KEY = "audit";
export const conceptKey = (conceptId: string) => `concept:${conceptId}`;
export const checkKey = (questionId: string) => `check:${questionId}`;
export const exerciseKey = (exerciseId: string, questionId: string) => `exercise:${exerciseId}:${questionId}`;
export const exerciseCleanKey = (exerciseId: string) => `exercise:${exerciseId}:clean`;

/** XP for a whole-number audit score out of `total`, perfect-run bonus included. */
export function auditXp(score: number, total: number): number {
  return score * XP_REWARDS.auditCorrect + (total > 0 && score === total ? XP_REWARDS.perfectAudit : 0);
}

/**
 * The XP `key` is worth in `lesson`, from XP_REWARDS, or null when the key is not
 * in this lesson's content (or is `audit` without a whole-number score from 0 to
 * the audit length).
 */
export function xpForClaim(lesson: LessonContent, key: string, auditScore?: number): number | null {
  if (key === AUDIT_KEY) {
    const total = lesson.audit.length;
    if (typeof auditScore !== "number" || !Number.isInteger(auditScore) || auditScore < 0 || auditScore > total) {
      return null;
    }
    return auditXp(auditScore, total);
  }

  const [kind, ...rest] = key.split(":");
  if (kind === "concept" && rest.length === 1) {
    const found = lesson.groups.some((g) => g.concepts.some((c) => c.id === rest[0]));
    return found ? XP_REWARDS.conceptRead : null;
  }
  if (kind === "check" && rest.length === 1) {
    const found = lesson.groups.some((g) => g.check.some((q) => q.id === rest[0]));
    return found ? XP_REWARDS.checkCorrect : null;
  }
  if (kind === "exercise" && rest.length === 2) {
    const [exerciseId, part] = rest;
    const x = lesson.exercise;
    if (x.id !== exerciseId) return null;
    if (part === "clean") return XP_REWARDS.exerciseClean;
    return x.steps.some((q) => q.id === part) ? XP_REWARDS.exerciseCorrect : null;
  }
  return null;
}
