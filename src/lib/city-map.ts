import type { LessonMeta } from "./lesson-types";

export type DistrictStatus = "done" | "next" | "open" | "locked" | "coming-soon";
export type DistrictView = LessonMeta & { districtStatus: DistrictStatus; started: boolean; bestScore: number | null };

type ProgressMap = Record<string, { started: boolean; bestScore: number | null; completed: boolean }>;

/** Where each district stands for this learner, in catalog order. */
export function districtViews(catalog: readonly LessonMeta[], progress: ProgressMap | null, paid: boolean): DistrictView[] {
  let nextTaken = false;
  return catalog.map((meta) => {
    const p = progress?.[meta.id];
    let districtStatus: DistrictStatus;
    if (meta.status === "coming-soon") districtStatus = "coming-soon";
    else if (p?.completed) districtStatus = "done";
    else if (!meta.isFree && !paid) districtStatus = "locked";
    else if (!nextTaken) {
      nextTaken = true;
      districtStatus = "next";
    } else districtStatus = "open";
    return { ...meta, districtStatus, started: p?.started ?? false, bestScore: p?.bestScore ?? null };
  });
}
