import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import LessonList from "@/components/LessonList";
import { lessonViews } from "@/lib/lesson-progress";
import { LESSON_CATALOG, lessonPath } from "@/lib/lesson-catalog";
import type { LessonMeta } from "@/lib/lesson-types";

const catalog: LessonMeta[] = LESSON_CATALOG.map((l) => ({ ...l, status: l.order <= 3 ? "live" : "coming-soon" }));
const html = renderToStaticMarkup(<LessonList lessons={lessonViews(catalog, null, false)} />);

describe("LessonList", () => {
  it("renders every lesson", () => {
    for (const l of catalog) expect(html).toContain(`data-lesson="${l.id}"`);
    expect((html.match(/data-lesson=/g) ?? []).length).toBe(LESSON_CATALOG.length);
  });

  it("links the next lesson to its page", () => {
    expect(html).toContain(`href="${lessonPath(catalog[0].id)}"`);
  });

  it("links locked lessons to /pricing", () => {
    expect(html).toContain('href="/pricing"');
    expect(html).toContain("Locked");
  });

  it("does not link coming-soon lessons", () => {
    expect(html).not.toContain(lessonPath(catalog[3].id));
    const soon = html.split("data-lesson=").filter((s) => s.includes("Coming soon"));
    expect(soon.length).toBe(LESSON_CATALOG.length - 3);
    for (const s of soon) expect(s.split("data-lesson=")[0]).not.toContain("href=");
  });

  it("shows a completed lesson's best score as N of M, not a percentage", () => {
    const done = renderToStaticMarkup(
      <LessonList
        lessons={lessonViews(
          catalog,
          { [catalog[0].id]: { started: true, bestScore: 8, completed: true } },
          false,
          { [catalog[0].id]: 10 }
        )}
      />
    );
    expect(done).toContain("Best score 8 of 10");
    expect(done).not.toContain("8%");
  });
});
