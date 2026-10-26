import { describe, expect, it } from "vitest";
import {
  KEYBOARD_STYLES,
  LETTERS,
  cardCells,
  keyboardMessagePath,
  cardLayout,
  cleanName,
  keyboardRestorePath,
  cleanKeys,
  decodeMessage,
  encodeMessage,
  glyphShadow,
  keyboardStyleById,
  printableName,
  readCardParams,
  spotWord,
  typedTransliteration,
} from "@/lib/keyboard-card";

const keys = (s: string) => [...s];

describe("keyboard card", () => {
  it("round-trips a message through the link without spelling it out", () => {
    const m = encodeMessage(keys("meet me at noon"));
    expect(m).not.toContain("noon");
    expect(m).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeMessage(m).join("")).toBe("meet me at noon");
  });

  it("only lets through what the keyboard can type", () => {
    expect(cleanKeys("Hi <b>there</b>!!  2u").join("")).toBe("hi bthereb u");
    expect(decodeMessage("not base64!")).toEqual([]);
    expect(decodeMessage(null)).toEqual([]);
  });

  it("falls back on unknown finish and card in a query", () => {
    const q = new URLSearchParams({ m: encodeMessage(keys("maya")), s: "gold", g: "wedding" });
    expect(readCardParams((k) => q.get(k))).toEqual({ typed: keys("maya"), style: "plain", template: "none", spell: "keys", letters: false, from: "" });
  });

  it("spots a Lesson 1 word by its consonants", () => {
    expect(spotWord(keys("pet"))?.meaning).toBe("sky");
    expect(spotWord(keys("ren"))?.meaning).toBe("name");
    expect(spotWord(keys("hello"))).toBeNull();
  });

  it("transliterates word by word", () => {
    expect(typedTransliteration(keys("pet ra"))).toBe("pjt rꜣ");
  });

  it("offers a print only for name-like text", () => {
    expect(printableName(keys("maya"))).toBe("maya");
    expect(printableName(keys("this is far too many words"))).toBeNull();
    expect(printableName([])).toBeNull();
  });

  it("keeps the signs inside the box on every finish", () => {
    for (const s of KEYBOARD_STYLES) {
      for (const text of ["a", "maya", "cleopatra loves you", "x".repeat(120)]) {
        const L = cardLayout(keys(text), s.id, "birthday");
        const widest = Math.max(...L.lines.map((l) => l.filter((k) => k !== " ").length));
        expect(widest * L.glyph * 0.92).toBeLessThanOrEqual(L.box.w + 1);
        expect(L.lines.length * L.glyph * 1.3).toBeLessThanOrEqual(L.box.h);
        // with the letters under the signs, each line is taller and still fits
        const W = cardLayout(keys(text), s.id, "birthday", "keys", true);
        expect(W.lines.length * W.glyph * (1.3 + LETTERS.line)).toBeLessThanOrEqual(W.box.h);
      }
    }
  });

  it("puts the English letters under each sign, one cell for one sign", () => {
    const L = cardLayout(keys("ra pet"), "pyramids", "none", "keys", true);
    expect(L.letters.flat().join("")).toBe("RA PET");
    expect(L.letters.map((l) => l.length)).toEqual(L.lines.map((l) => l.length));
    expect(cardLayout(keys("ra"), "pyramids").letters).toEqual([]);
    // a name's SH and TH are one sign each, so their letters share it
    const N = cardLayout(keys("sasha thomas"), "stars", "none", "name", true);
    expect(N.letters.flat()).toContain("SH");
    expect(N.letters.flat()).toContain("TH");
    expect(N.letters.flat().length).toBe(N.lines.flat().length);
  });

  it("keeps the letters in the link, but never on a secret message", () => {
    const path = keyboardRestorePath({ typed: keys("maya"), style: "pyramids", letters: true });
    const q = new URLSearchParams(path.split("?")[1]);
    expect(readCardParams((k) => q.get(k)).letters).toBe(true);
    expect(keyboardMessagePath(keys("maya"), "pyramids")).not.toContain("l=1");
  });

  it("writes shadows in px for satori and em for the page", () => {
    const temple = keyboardStyleById("temple");
    expect(glyphShadow(temple, "#000", 100)).toContain("px");
    expect(glyphShadow(temple, "#000")).toContain("em");
    expect(glyphShadow(keyboardStyleById("plain"), "#000")).toBeUndefined();
  });

  it("spells a name by sound, word by word, in one cartouche line", () => {
    expect(cardCells(keys("thomas"), "name").length).toBe(5); // TH is one sign
    expect(cardCells(keys("mary anne"), "name")).toContain(" ");
    const L = cardLayout(cleanName("Mary-Anne O'Brien"), "lotus", "birthday", "name");
    expect(L.cartouche).toBe(true);
    expect(L.lines).toHaveLength(1);
  });

  it("carries accented names through the link", () => {
    const typed = cleanName("Zoë");
    const q = new URLSearchParams(keyboardRestorePath({ typed, style: "night", spell: "name" }).split("?")[1]);
    expect(keyboardRestorePath({ typed, style: "night", spell: "name" })).toMatch(/^\/translate-name-to-hieroglyphics\/zo%C3%AB\?/);
    expect(q.get("s")).toBe("night");
    expect(decodeMessage(encodeMessage(typed), "name").join("")).toBe("zoë");
    expect(readCardParams((k) => ({ m: encodeMessage(typed), t: "n" })[k] ?? null).spell).toBe("name");
  });
});

import { isGiftSeason, offeredTemplates } from "@/lib/keyboard-card";

describe("gift season", () => {
  it("runs from 1 November to Christmas Day", () => {
    expect(isGiftSeason(new Date(2026, 9, 31))).toBe(false);
    expect(isGiftSeason(new Date(2026, 10, 1))).toBe(true);
    expect(isGiftSeason(new Date(2026, 11, 25))).toBe(true);
    expect(isGiftSeason(new Date(2026, 11, 26))).toBe(false);
  });
  it("offers the Christmas card only in season, straight after No card", () => {
    expect(offeredTemplates(new Date(2026, 9, 16)).map((t) => t.id)).not.toContain("christmas");
    expect(offeredTemplates(new Date(2026, 11, 1))[1].id).toBe("christmas");
  });
});
