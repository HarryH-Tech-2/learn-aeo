import { describe, expect, it } from "vitest";
import { districtViews } from "@/lib/city-map";
import type { LessonMeta } from "@/lib/lesson-types";

// Lessons 1-3 live, 4-8 coming soon; built inline so this does not depend on the real catalog.
const catalog: LessonMeta[] = Array.from({ length: 8 }, (_, i) => ({
  id: `lesson-${i + 1}`,
  order: i + 1,
  district: `District ${i + 1}`,
  title: `Title ${i + 1}`,
  summary: "s",
  description: "d",
  level: "beginner",
  minutes: 20,
  isFree: i === 0,
  status: i < 3 ? "live" : "coming-soon",
}));

const statuses = (v: ReturnType<typeof districtViews>) => v.map((d) => d.districtStatus);

describe("districtViews", () => {
  it("with no progress and no access: 1 next, 2-3 locked, 4-8 coming soon", () => {
    expect(statuses(districtViews(catalog, null, false))).toEqual([
      "next", "locked", "locked", "coming-soon", "coming-soon", "coming-soon", "coming-soon", "coming-soon",
    ]);
  });

  it("with lesson 1 done and paid: 1 done, 2 next, 3 open", () => {
    const v = districtViews(catalog, { "lesson-1": { started: true, bestScore: 90, completed: true } }, true);
    expect(statuses(v).slice(0, 4)).toEqual(["done", "next", "open", "coming-soon"]);
    expect(v[0]).toMatchObject({ started: true, bestScore: 90 });
    expect(v[1]).toMatchObject({ started: false, bestScore: null });
  });

  it("carries each lesson's audit length so a best score reads as N of M", () => {
    const v = districtViews(
      catalog,
      { "lesson-1": { started: true, bestScore: 8, completed: true } },
      true,
      { "lesson-1": 10, "lesson-2": 9 }
    );
    expect(v[0]).toMatchObject({ bestScore: 8, auditTotal: 10 });
    expect(v[1].auditTotal).toBe(9);
    expect(v[3].auditTotal).toBeNull();
  });

  it("keeps a completed coming-soon id as coming-soon", () => {
    const v = districtViews(catalog, { "lesson-4": { started: true, bestScore: 100, completed: true } }, true);
    expect(v[3].districtStatus).toBe("coming-soon");
  });
});
