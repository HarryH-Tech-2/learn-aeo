import { describe, expect, it, vi } from "vitest";

// (SealedPanel asks for the session to spot the free-unlock test's free group)
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
import { renderToStaticMarkup } from "react-dom/server";
import ProgressMap from "@/components/ProgressMap";
import { EMPTY_EXPEDITION, type ExpeditionState } from "@/lib/expedition";

const zone = (over: Partial<Parameters<typeof ProgressMap>[0]["zones"][number]> = {}) => ({
  id: "expedition-begins",
  name: "The Expedition Begins",
  areaName: "Uniliteral Signs",
  completed: false,
  started: true,
  bestScore: null,
  locked: false,
  position: { top: "0", left: "0" },
  ...over,
});

function render(done: number, completed = false) {
  const expedition: ExpeditionState = { ...EMPTY_EXPEDITION, sections: done ? { "expedition-begins": { done, name: "Mary", at: "2026-10-01T00:00:00Z" } } : {} };
  return renderToStaticMarkup(<ProgressMap zones={[zone({ completed })]} streak={0} xp={0} expedition={expedition} />);
}

describe("ProgressMap: Lesson 1 in parts", () => {
  it("shows one card per part, each opening that part", () => {
    const html = render(0);
    expect(html.match(/The Expedition Begins · part \d/g)).toEqual(["The Expedition Begins · part 1", "The Expedition Begins · part 2", "The Expedition Begins · part 3"]);
    expect(html).toContain('href="/lessons/expedition-begins"');
    expect(html).toContain('href="/lessons/expedition-begins?part=2"');
    expect(html).toContain('href="/lessons/expedition-begins?part=3"');
    expect(html).toContain("Start here");
  });

  it("marks finished parts and the next one", () => {
    const html = render(1);
    expect(html).toContain("Up next");
    expect(html).not.toContain("Start here");
  });

  it("a completed lesson has no part left to do", () => {
    const html = render(0, true);
    expect(html).not.toContain("Up next");
    expect(html).not.toContain("Start here");
  });
});
