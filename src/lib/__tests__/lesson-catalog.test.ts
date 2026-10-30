import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  COURSE_PARTS,
  FIRST_LESSON_ID,
  FIRST_LESSON_PATH,
  LESSON_CATALOG,
  TOTAL_MINUTES,
  courseParts,
  lessonMeta,
  lessonPath,
  nextLessonMeta,
  publicLessonPaths,
  titleMidSentence,
} from "../lesson-catalog";

const EXPECTED = [
  ["how-answer-engines-choose-sources", "The Gate", "How answer engines choose sources", "beginner", 25, true],
  ["make-your-site-reachable-by-ai", "The Crawl Docks", "Make your site reachable by AI", "beginner", 30, false],
  ["writing-citable-content", "The Answer Quarter", "Writing citable content", "beginner", 30, false],
  ["structured-data-and-entities", "The Schema Works", "Structured data and entities", "intermediate", 30, false],
  ["authority-beyond-your-site", "The Agora", "Authority beyond your site", "intermediate", 25, false],
  ["platform-playbooks", "The Embassies", "Platform playbooks", "intermediate", 25, false],
  ["measuring-ai-visibility", "The Observatory", "Measuring AI visibility", "advanced", 25, false],
  ["running-an-aeo-program", "The Citadel", "Running an AEO program", "advanced", 20, false],
] as const;

describe("lesson catalog", () => {
  it("matches the agreed lesson table", () => {
    expect(LESSON_CATALOG).toHaveLength(8);
    LESSON_CATALOG.forEach((l, i) => {
      const [id, district, title, level, minutes, isFree] = EXPECTED[i];
      expect(l).toMatchObject({ id, district, title, level, minutes, isFree, order: i + 1 });
      expect(l.summary.length).toBeGreaterThan(10);
      expect(l.description.length).toBeGreaterThan(40);
      expect(l.status).toBe(i <= 5 ? "live" : "coming-soon");
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
    expect(nextLessonMeta("running-an-aeo-program")).toBeUndefined();
    expect(nextLessonMeta(FIRST_LESSON_ID)?.order).toBe(2);
    expect(nextLessonMeta("nope")).toBeUndefined();
  });

  it("lowercases only the first letter of a title used mid-sentence, keeping AEO", () => {
    expect(titleMidSentence("Running an AEO program")).toBe("running an AEO program");
    expect(titleMidSentence("Make your site reachable by AI")).toBe("make your site reachable by AI");
    expect(titleMidSentence(LESSON_CATALOG[LESSON_CATALOG.length - 1].title)).toContain("AEO");
  });

  it("imports only lesson-types (middleware imports it)", () => {
    const src = readFileSync(join(__dirname, "..", "lesson-catalog.ts"), "utf8");
    const specs = [...src.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)].map((m) => m[1]);
    for (const s of specs) expect(["./lesson-types", "@/lib/lesson-types"]).toContain(s);
    expect(src).not.toMatch(/^\s*import\s+["']/m);
    expect(src).not.toMatch(/\brequire\(/);
  });
});

describe("course parts", () => {
  it("puts every lesson in exactly one part, in catalog order", () => {
    const ids = COURSE_PARTS.flatMap((p) => p.lessonIds);
    expect(ids).toEqual(LESSON_CATALOG.map((l) => l.id));
  });

  it("numbers the parts and resolves their lessons", () => {
    const parts = courseParts();
    expect(parts.map((p) => p.number)).toEqual([1, 2, 3, 4]);
    for (const p of parts) expect(p.lessons).toHaveLength(p.part.lessonIds.length);
  });
});
