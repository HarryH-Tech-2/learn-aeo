// The lesson registry: the catalog with content attached to each live lesson.
// The catalog (lesson-catalog.ts) stays edge-safe; this module pulls in content.

import { LESSON_CATALOG } from "./lesson-catalog";
import type { LessonContent, LessonMeta } from "./lesson-types";
import { LESSON_1 } from "./content/lesson-1-the-gate";
import { LESSON_2 } from "./content/lesson-2-the-crawl-docks";

export type LiveLesson = LessonMeta & { status: "live"; content: LessonContent };
export type Lesson = LiveLesson | (LessonMeta & { status: "coming-soon" });

/** Content for each live lesson, keyed by lesson id. */
export const CONTENT: Readonly<Record<string, LessonContent>> = {
  "how-answer-engines-choose-sources": LESSON_1,
  "make-your-site-reachable-by-ai": LESSON_2,
};

export const LESSONS: readonly Lesson[] = LESSON_CATALOG.map((meta): Lesson => {
  const content = CONTENT[meta.id];
  if (meta.status === "live") {
    if (!content) throw new Error(`Lesson ${meta.id} is live but has no content`);
    return { ...meta, status: "live", content };
  }
  return { ...meta, status: "coming-soon" };
});

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function isLive(l: Lesson | undefined): l is LiveLesson {
  return l?.status === "live";
}
