import type { LessonMeta } from "./lesson-types";

export type ProgressStatus = "done" | "next" | "open" | "locked" | "coming-soon";
/** bestScore is the raw count of audit answers right; auditTotal is how many questions that audit has. */
export type LessonView = LessonMeta & {
  progressStatus: ProgressStatus;
  started: boolean;
  bestScore: number | null;
  auditTotal: number | null;
};

type ProgressMap = Record<string, { started: boolean; bestScore: number | null; completed: boolean }>;

/** Where each lesson stands for this learner, in catalog order. */
export function lessonViews(
  catalog: readonly LessonMeta[],
  progress: ProgressMap | null,
  paid: boolean,
  auditLengths: Readonly<Record<string, number>> = {}
): LessonView[] {
  let nextTaken = false;
  return catalog.map((meta) => {
    const p = progress?.[meta.id];
    let progressStatus: ProgressStatus;
    if (meta.status === "coming-soon") progressStatus = "coming-soon";
    else if (p?.completed) progressStatus = "done";
    else if (!meta.isFree && !paid) progressStatus = "locked";
    else if (!nextTaken) {
      nextTaken = true;
      progressStatus = "next";
    } else progressStatus = "open";
    return { ...meta, progressStatus, started: p?.started ?? false, bestScore: p?.bestScore ?? null, auditTotal: auditLengths[meta.id] ?? null };
  });
}
