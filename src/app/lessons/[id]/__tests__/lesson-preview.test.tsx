import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LessonOverview, { lessonSources } from "../LessonOverview";
import { LESSONS, isLive } from "@/lib/lessons";

// Paid lessons' public preview pages (signed-out visitors and crawlers get this server-rendered text).
const paid = LESSONS.filter(isLive).filter((l) => !l.isFree);

describe("paid lesson preview", () => {
  it("has live paid lessons to preview", () => {
    expect(paid.length).toBeGreaterThan(0);
  });

  it.each(paid.map((l) => [l.id, l] as const))("%s shows its intro, outline, exercise brief and sources", (_id, lesson) => {
    const html = renderToStaticMarkup(<LessonOverview lesson={lesson} />);
    const text = (s: string) => renderToStaticMarkup(<>{s}</>);
    expect(html).toContain(text(lesson.description));
    expect(html).toContain(text(lesson.content.intro));
    expect(html).toContain(text(lesson.content.exercise.brief));
    for (const g of lesson.content.groups) for (const k of g.concepts) expect(html).toContain(text(k.term));
    for (const s of lessonSources(lesson)) expect(html).toContain(`href="${text(s.url)}"`);
  });

  it("never shows a concept's full explanation, the exercise steps or the audit", () => {
    for (const lesson of paid) {
      const html = renderToStaticMarkup(<LessonOverview lesson={lesson} />);
      const text = (s: string) => renderToStaticMarkup(<>{s}</>);
      const k = lesson.content.groups[0].concepts[0];
      expect(html).not.toContain(text(k.explanation));
      expect(html).not.toContain(text(k.pitfall));
      expect(html).not.toContain(text(lesson.content.exercise.steps[0].prompt));
      expect(html).not.toContain(text(lesson.content.audit[0].prompt));
    }
  });

  it("lists each source once", () => {
    for (const lesson of paid) {
      const urls = lessonSources(lesson).map((s) => s.url);
      expect(new Set(urls).size).toBe(urls.length);
    }
  });
});
