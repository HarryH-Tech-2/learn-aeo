import { describe, it, expect } from "vitest";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { lessonHrefForName, distinctSigns, FREE_LESSON_PATH } from "@/lib/translator-bridge";

describe("translator → lesson hand-off", () => {
  it("dedupes repeated signs but keeps first-seen order", () => {
    const signs = distinctSigns(transliterateName("Anna"));
    const glyphs = signs.map((s) => s.mapping.glyph);
    expect(new Set(glyphs).size).toBe(glyphs.length);
    expect(glyphs.length).toBeLessThan(transliterateName("Anna").length);
  });

  it("carries the name and the signs to the free lesson", () => {
    const href = lessonHrefForName("  Nancy ", transliterateName("Nancy"));
    const url = new URL(href, "https://www.learnhieroglyphics.com");
    expect(url.pathname).toBe(FREE_LESSON_PATH);
    expect(url.searchParams.get("name")).toBe("Nancy");
    expect(url.searchParams.get("from")).toBe("translator");
    // guest play: the game opens without the sign-up wall (src/lib/guest-play.ts)
    expect(url.searchParams.get("play")).toBe("1");
    const signs = url.searchParams.get("signs") ?? "";
    expect([...signs].length).toBe(distinctSigns(transliterateName("Nancy")).length);
  });

  it("survives names with spaces and punctuation", () => {
    const href = lessonHrefForName("Mary-Jo O'Neil", transliterateName("Mary-Jo O'Neil"));
    const url = new URL(href, "https://www.learnhieroglyphics.com");
    expect(url.searchParams.get("name")).toBe("Mary-Jo O'Neil");
    // The sign-up modal only honours a return path made of these characters
    // (see destinationFor in src/components/AuthModal.tsx), so a "+" would
    // drop the learner on the dashboard instead of their door.
    expect(href).toMatch(/^\/(?!\/)[\w\-./?=&%]*$/);
    expect(href).not.toContain("+");
  });
});
