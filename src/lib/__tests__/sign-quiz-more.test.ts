import { describe, expect, it } from "vitest";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { signForKey } from "@/lib/hieroglyph-keyboard";
import { distinctSigns } from "@/lib/translator-bridge";
import { MORE_SIGNS, moreSignQuestions, moreSigns } from "@/lib/sign-quiz";

const NAMES = ["Noah", "Cecil", "Charlotte", "Philip", "Al", "Olivia", "Mary-Jo O'Neil", "Zsuzsanna", "Quentin", "Xavier", "Bo", "Cleopatra", "Nyx", "Mohammed", "Kai", "Jacqueline"];

// Signs that sound alike: never taught together, never taught beside a name that has the other.
const FAMILIES = [
  ["\u{133A1}", "\u{1320E}"], // basket k, hill slope q
  ["\u{13254}", "\u{1340D}"], // reed shelter h, placenta kh
  ["\u{130A7}", "\u{13193}"], // hand d, cobra dj
];

function nameGlyphs(name: string): Set<string> {
  return new Set(distinctSigns(transliterateName(name)).flatMap((r) => Array.from(r.mapping.glyph)));
}

describe("moreSigns", () => {
  it("picks three signs the name does not use", () => {
    for (const name of NAMES) {
      const picked = moreSigns(name, transliterateName(name));
      expect(picked.length).toBe(MORE_SIGNS);
      const used = nameGlyphs(name);
      for (const s of picked) expect(used.has(s.glyph)).toBe(false);
      expect(new Set(picked.map((s) => s.glyph)).size).toBe(MORE_SIGNS);
    }
  });

  it("is the same for the same name, and differs between names", () => {
    for (const name of NAMES) expect(moreSigns(name, transliterateName(name))).toEqual(moreSigns(name, transliterateName(name)));
    const sets = new Set(NAMES.map((n) => moreSigns(n, transliterateName(n)).map((s) => s.glyph).sort().join("")));
    expect(sets.size).toBeGreaterThan(3);
  });

  it("never teaches two sound-alikes, or a sound-alike of a sign in the name", () => {
    for (const name of NAMES) {
      const picked = moreSigns(name, transliterateName(name));
      expect(new Set(picked.map((s) => s.family)).size).toBe(picked.length);
      const used = nameGlyphs(name);
      const taught = picked.map((s) => s.glyph);
      for (const family of FAMILIES) {
        const inName = family.some((g) => used.has(g));
        expect(family.filter((g) => taught.includes(g)).length).toBeLessThanOrEqual(inName ? 0 : 1);
      }
    }
  });

  it("splits a two-sign letter: X counts as the basket and the folded cloth", () => {
    const picked = moreSigns("Xx", transliterateName("Xx")).map((s) => s.glyph);
    expect(picked).not.toContain("\u{133A1}");
    expect(picked).not.toContain("\u{132F4}");
    expect(picked).not.toContain("\u{1320E}"); // q sounds like the basket's k
  });

  it("works for keyboard text, one sign per key", () => {
    const typed = "hello world".split("");
    const results = typed.flatMap((k) => { const mapping = k === " " ? null : signForKey(k); return mapping ? [{ input: k, mapping }] : []; });
    const picked = moreSigns("hello world", results);
    expect(picked.length).toBe(MORE_SIGNS);
    const used = new Set(results.map((r) => r.mapping.glyph));
    for (const s of picked) expect(used.has(s.glyph)).toBe(false);
  });

  it("returns fewer, never a repeat, when the name uses nearly every sign", () => {
    const text = "abdfghijmnprstwsh";
    const picked = moreSigns(text, transliterateName(text));
    const used = nameGlyphs(text);
    for (const s of picked) expect(used.has(s.glyph)).toBe(false);
    expect(picked.length).toBeLessThan(MORE_SIGNS);
  });
});

describe("moreSignQuestions", () => {
  it("asks one question per new sign, four different options, never a sound-alike wrong answer", () => {
    for (const name of NAMES) {
      const results = transliterateName(name);
      const signs = moreSigns(name, results);
      const qs = moreSignQuestions(name, results, signs);
      expect(qs.length).toBe(signs.length);
      qs.forEach((q, i) => {
        expect(q.glyph).toBe(signs[i].glyph);
        expect(q.kind).toBe(i % 2 === 0 ? "sign" : "sound");
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.options[q.answer]).toBe(q.kind === "sign" ? signs[i].glyph : signs[i].letter);
        for (const family of FAMILIES) {
          if (q.kind === "sign" && family.includes(q.glyph)) {
            expect(q.options.filter((o) => family.includes(o)).length).toBe(1);
          }
        }
      });
      expect(moreSignQuestions(name, results, signs)).toEqual(qs);
    }
  });
});
