import { describe, it, expect, vi } from "vitest";

// A lesson forced to "coming soon", so the coming-soon branch stays tested once every real lesson is live.
vi.mock("@/lib/lesson-catalog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/lesson-catalog")>();
  const LESSON_CATALOG = actual.LESSON_CATALOG.map((l) =>
    l.id === "running-an-aeo-program" ? { ...l, status: "coming-soon" as const } : l,
  );
  return { ...actual, LESSON_CATALOG };
});
import sitemap from "@/app/sitemap";
import { GET as llms } from "@/app/llms.txt/route";
import { SITE } from "@/lib/site";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";

describe("sitemap lessons", () => {
  it("lists the free live lesson and no other lesson URL", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    const lessonUrls = urls.filter((u) => u.includes("/lessons/"));
    expect(lessonUrls).toEqual([`${SITE.url}/lessons/how-answer-engines-choose-sources`]);
  });
});

describe("llms.txt lessons", () => {
  it("lists all 8 lessons by title, marking the free one and the coming-soon ones", async () => {
    const body = await llms().text();
    const lines = body.split("\n");
    expect(LESSON_CATALOG).toHaveLength(8);
    expect(LESSON_CATALOG.some((l) => l.status === "coming-soon"), "no coming-soon lesson to test").toBe(true);
    for (const l of LESSON_CATALOG) {
      const line = lines.find((x) => x.includes(l.title));
      expect(line, l.title).toBeDefined();
      if (l.isFree) expect(line).toMatch(/free/i);
      if (l.status === "coming-soon") expect(line).toMatch(/coming soon/i);
      else expect(line).not.toMatch(/coming soon/i);
    }
  });
});
