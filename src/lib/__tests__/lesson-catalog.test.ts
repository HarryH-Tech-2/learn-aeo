import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FIRST_LESSON_ID,
  FIRST_LESSON_PATH,
  LESSON_CATALOG,
  TOTAL_MINUTES,
  lessonMeta,
  lessonPath,
  nextLessonMeta,
  publicLessonPaths,
} from "../lesson-catalog";

const EXPECTED = [
  ["how-answer-engines-choose-sources", "The Gate", "How answer engines choose sources", "beginner", 25, true],
  ["make-your-site-reachable-by-ai", "The Crawl Docks", "Make your site reachable by AI", "beginner", 30, false],
  ["writing-citable-content", "The Answer Quarter", "Writing citable content", "beginner", 30, false],
  ["structured-data-and-entities", "The Schema Works", "Structured data and entities", "intermediate", 30, false],
  ["authority-beyond-your-site", "The Agora", "Authority beyond your site", "intermediate", 25, false],
  ["platform-playbooks", "The Embassies", "Platform playbooks", "intermediate", 25, false],
  ["measuring-ai-visibility", "The Observatory", "Measuring AI visibility", "advanced", 25, false],
  ["running-an-aeo-programme", "The Citadel", "Running an AEO programme", "advanced", 20, false],
] as const;

describe("lesson catalog", () => {
  it("matches the agreed lesson table", () => {
    expect(LESSON_CATALOG).toHaveLength(8);
    LESSON_CATALOG.forEach((l, i) => {
      const [id, district, title, level, minutes, isFree] = EXPECTED[i];
      expect(l).toMatchObject({ id, district, title, level, minutes, isFree, order: i + 1 });
      expect(l.summary.length).toBeGreaterThan(10);
      expect(l.description.length).toBeGreaterThan(40);
      expect(l.status).toBe(i <= 2 ? "live" : "coming-soon");
    });
    expect(new Set(LESSON_CATALOG.map((l) => l.id)).size).toBe(8);
  });

  it("has totals and paths", () => {
    expect(TOTAL_MINUTES).toBe(210);
    expect(FIRST_LESSON_PATH).toBe("/lessons/how-answer-engines-choose-sources");
    expect(lessonPath(FIRST_LESSON_ID)).toBe(FIRST_LESSON_PATH);
    expect(publicLessonPaths()).toEqual([FIRST_LESSON_PATH]);
  });

  it("looks lessons up and walks to the next", () => {
    expect(lessonMeta("nope")).toBeUndefined();
    expect(lessonMeta(FIRST_LESSON_ID)?.order).toBe(1);
    expect(nextLessonMeta("running-an-aeo-programme")).toBeUndefined();
    expect(nextLessonMeta(FIRST_LESSON_ID)?.order).toBe(2);
    expect(nextLessonMeta("nope")).toBeUndefined();
  });

  it("imports only lesson-types (middleware imports it)", () => {
    const src = readFileSync(join(__dirname, "..", "lesson-catalog.ts"), "utf8");
    const specs = [...src.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)].map((m) => m[1]);
    for (const s of specs) expect(["./lesson-types", "@/lib/lesson-types"]).toContain(s);
    expect(src).not.toMatch(/^\s*import\s+["']/m);
    expect(src).not.toMatch(/\brequire\(/);
  });
});
