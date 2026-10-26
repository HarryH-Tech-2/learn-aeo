import { describe, it, expect } from "vitest";
import { catalogue, glyphsForLearner, makeQuestion, signInfo, xpForRepaint } from "../wall";

describe("catalogue", () => {
  it("has every uniliteral and no duplicate glyphs", () => {
    const c = catalogue();
    expect(c.length).toBeGreaterThanOrEqual(25);
    expect(new Set(c.map((s) => s.glyph)).size).toBe(c.length);
    expect(signInfo("𓄿")?.lessonId).toBe("expedition-begins");
  });

  it("free learners get lesson 1; paid learners add completed lessons", () => {
    const free = glyphsForLearner(["outer-courtyard"], false);
    const paid = glyphsForLearner(["outer-courtyard"], true);
    expect(free.length).toBe(catalogue().filter((s) => s.lessonId === "expedition-begins").length);
    expect(paid.length).toBeGreaterThan(free.length);
    expect(glyphsForLearner([], true)).toEqual(free);
  });
});

describe("questions", () => {
  it("builds each kind with four distinct options and one right answer", () => {
    for (const kind of ["sound", "meaning", "pick"] as const) {
      const q = makeQuestion("𓅓", 7, kind)!;
      expect(q.kind).toBe(kind);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      const right = q.options[q.answer];
      if (kind === "pick") expect(right).toBe("𓅓");
      if (kind === "sound") expect(right).toBe(signInfo("𓅓")!.translit);
      if (kind === "meaning") expect(right).toBe(signInfo("𓅓")!.name);
    }
  });

  it("is reproducible for a seed and null for unknown glyphs", () => {
    expect(makeQuestion("𓏏", 3)).toEqual(makeQuestion("𓏏", 3));
    expect(makeQuestion("𓀀𓀀𓀀", 3)).toBeNull();
  });

  it("xp", () => {
    expect(xpForRepaint(5)).toBe(10);
    expect(xpForRepaint(3)).toBe(6);
    expect(xpForRepaint(1)).toBe(0);
  });
});
