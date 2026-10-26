import { describe, it, expect } from "vitest";
import { buildGlossary, filterGlossary, shortMeaning } from "@/lib/glossary";
import { lessons, getLessonGlyphs } from "@/lib/lessons";

describe("glossary", () => {
  const entries = buildGlossary();

  it("includes every glyph from every lesson, deduplicated by symbol", () => {
    const allSymbols = new Set(lessons.flatMap((l) => getLessonGlyphs(l).map((g) => g.symbol)));
    expect(new Set(entries.map((e) => e.symbol))).toEqual(allSymbols);
    expect(entries.length).toBe(allSymbols.size);
  });

  it("orders entries by lesson order", () => {
    const orders = entries.map((e) => e.lessonOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("tags each entry with its lesson", () => {
    const owl = entries.find((e) => e.symbol === "\u{13153}");
    expect(owl?.lessonId).toBeTruthy();
    expect(owl?.lessonTitle).toBeTruthy();
    expect(typeof owl?.lessonFree).toBe("boolean");
  });

  it("filters by transliteration, meaning, pronunciation, or exact symbol", () => {
    expect(filterGlossary(entries, "").length).toBe(entries.length);
    expect(filterGlossary(entries, "owl").some((e) => e.symbol === "\u{13153}")).toBe(true);
    expect(filterGlossary(entries, "MOTHER").some((e) => e.symbol === "\u{13153}")).toBe(true);
    expect(filterGlossary(entries, "\u{13153}").map((e) => e.symbol)).toEqual(["\u{13153}"]);
    expect(filterGlossary(entries, "zzzz-no-such-glyph")).toEqual([]);
  });

  it("matches transliterations regardless of diacritics", () => {
    // ḫpr (scarab) should be findable as plain "hpr"
    expect(filterGlossary(entries, "hpr").some((e) => e.transliteration === "ḫpr")).toBe(true);
  });

  it("shortens meanings to the part before the dash or colon", () => {
    expect(shortMeaning("Owl — one of the most common uniliteral signs")).toBe("Owl");
    expect(shortMeaning("Water: ripple")).toBe("Water");
    expect(shortMeaning("Plain")).toBe("Plain");
  });
});
