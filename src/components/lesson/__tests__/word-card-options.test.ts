import { describe, expect, it } from "vitest";
import { readingOptions } from "@/components/lesson/WordCard";
import { WORDS } from "@/lib/content/uniliteral-words";

describe("readingOptions", () => {
  it("gives every word three different readings, one of them right", () => {
    for (const w of WORDS) {
      const o = readingOptions(w);
      expect(o).toHaveLength(3);
      expect(new Set(o).size).toBe(3);
      expect(o).toContain(w.translit);
    }
  });

  it("is the same every time for a word", () => {
    expect(readingOptions(WORDS[0])).toEqual(readingOptions(WORDS[0]));
  });
});
