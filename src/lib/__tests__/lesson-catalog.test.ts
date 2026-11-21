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
  ["how-answer-engines-choose-sources", "How answer engines choose sources", "beginner", 25, true],
  ["make-your-site-reachable-by-ai", "Make your site reachable by AI", "beginner", 40, false],
  ["writing-citable-content", "Writing citable content", "beginner", 35, false],
  ["structured-data-and-entities", "Structured data and entities", "intermediate", 40, false],
  ["authority-beyond-your-site", "Authority beyond your site", "intermediate", 35, false],
  ["platform-playbooks", "Platform playbooks", "intermediate", 35, false],
  ["measuring-ai-visibility", "Measuring AI visibility", "advanced", 35, false],
  ["running-an-aeo-program", "Running an AEO program", "advanced", 35, false],
  ["products-and-shopping-in-ai-answers", "Products and shopping in AI answers", "intermediate", 25, false],
  ["local-businesses-and-reviews", "Local businesses and reviews in AI answers", "intermediate", 35, false],
  ["video-images-and-youtube", "Video, images and YouTube in AI answers", "intermediate", 25, false],
  ["when-ai-gets-your-brand-wrong", "When AI gets your brand wrong", "intermediate", 30, false],
] as const;

describe("lesson catalog", () => {
  it("matches the agreed lesson table", () => {
    expect(LESSON_CATALOG).toHaveLength(12);
    LESSON_CATALOG.forEach((l, i) => {
      const [id, title, level, minutes, isFree] = EXPECTED[i];
      expect(l).toMatchObject({ id, title, level, minutes, isFree, order: i + 1 });
      expect(l.summary.length).toBeGreaterThan(10);
      expect(l.description.length).toBeGreaterThan(40);
      expect(l.status).toBe("live");
    });
    expect(new Set(LESSON_CATALOG.map((l) => l.id)).size).toBe(12);
  });

  it("has totals and paths", () => {
    expect(TOTAL_MINUTES).toBe(395);
    expect(FIRST_LESSON_PATH).toBe("/lessons/how-answer-engines-choose-sources");
    expect(lessonPath(FIRST_LESSON_ID)).toBe(FIRST_LESSON_PATH);
    expect(publicLessonPaths()).toEqual([FIRST_LESSON_PATH]);
  });

  it("looks lessons up and walks to the next", () => {
    expect(lessonMeta("nope")).toBeUndefined();
    expect(lessonMeta(FIRST_LESSON_ID)?.order).toBe(1);
    expect(nextLessonMeta("running-an-aeo-program")?.id).toBe("products-and-shopping-in-ai-answers");
    expect(nextLessonMeta("when-ai-gets-your-brand-wrong")).toBeUndefined();
    expect(nextLessonMeta(FIRST_LESSON_ID)?.order).toBe(2);
    expect(nextLessonMeta("nope")).toBeUndefined();
  });

  it("lowercases only the first letter of a title used mid-sentence, keeping AEO", () => {
    expect(titleMidSentence("Running an AEO program")).toBe("running an AEO program");
    expect(titleMidSentence("Make your site reachable by AI")).toBe("make your site reachable by AI");
    expect(titleMidSentence(LESSON_CATALOG[LESSON_CATALOG.length - 1].title)).toBe("when AI gets your brand wrong");
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
    expect(parts.map((p) => p.number)).toEqual([1, 2, 3, 4, 5]);
    for (const p of parts) expect(p.lessons).toHaveLength(p.part.lessonIds.length);
  });
});
