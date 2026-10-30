// What a crawler that doesn't run JavaScript gets from a lesson page: the server HTML, before the
// player loads the lesson. The free lesson must carry its title as the h1 and what it covers.
import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "loading" }) }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "how-answer-engines-choose-sources" }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/lessons/how-answer-engines-choose-sources",
}));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import LessonPage from "@/app/lessons/[id]/page";
import { getLesson, isLive } from "@/lib/lessons";

const ID = "how-answer-engines-choose-sources";

async function serverHtml(id: string) {
  return renderToStaticMarkup(await LessonPage({ params: Promise.resolve({ id }) }));
}

describe("free lesson server HTML", () => {
  it("has exactly one h1, the lesson title", async () => {
    const lesson = getLesson(ID)!;
    const h1s = (await serverHtml(ID)).match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toContain(lesson.title);
  });

  it("describes the lesson and lists every concept with its one-line answer", async () => {
    const lesson = getLesson(ID);
    if (!isLive(lesson)) throw new Error("lesson 1 is not live");
    const html = (await serverHtml(ID)).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    expect(html).toContain(lesson.description);
    for (const g of lesson.content.groups) {
      expect(html, g.title).toContain(g.title);
      for (const k of g.concepts) {
        expect(html, k.term).toContain(k.term);
        expect(html, k.id).toContain(k.summary);
      }
    }
  });
});
