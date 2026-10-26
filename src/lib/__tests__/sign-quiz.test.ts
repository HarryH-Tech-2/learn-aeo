import { describe, expect, it } from "vitest";
import { getAlphabetMappings, transliterateName } from "@/lib/hieroglyph-translator";
import { distinctSigns } from "@/lib/translator-bridge";
import { ENGLISH_EQUIVALENT, UNILITERALS } from "@/components/AlphabetTable";
import { READ_BACK_MAX, chartQuestion, nameQuestions, seededRandom, soundFamily, type ChartSign } from "@/lib/sign-quiz";

const NAMES = ["Noah", "Cecil", "Charlotte", "Philip", "Al", "Olivia", "Mary-Jo O'Neil", "Zsuzsanna", "Quentin", "Xavier", "Bo"];

function questions(name: string) {
  return nameQuestions(name, transliterateName(name));
}

describe("nameQuestions", () => {
  it("asks about signs of the name, at most three, one per distinct sign", () => {
    for (const name of NAMES) {
      const signs = distinctSigns(transliterateName(name)).map((s) => s.mapping.glyph);
      const qs = questions(name);
      expect(qs.length).toBe(Math.min(READ_BACK_MAX, signs.length));
      expect(new Set(qs.map((q) => q.glyph)).size).toBe(qs.length);
      for (const q of qs) expect(signs).toContain(q.glyph);
    }
  });

  it("draws the same questions for the same name, so server and browser agree", () => {
    for (const name of NAMES) expect(questions(name)).toEqual(questions(name));
    expect(questions("  noah ")).toEqual(questions("  noah "));
  });

  it("gives four different options with the right one where it says", () => {
    for (const name of NAMES) {
      for (const q of questions(name)) {
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4);
        const right = q.options[q.answer];
        if (q.kind === "sign") expect(right).toBe(q.glyph);
        else expect(right).toBe(right.toUpperCase());
      }
    }
  });

  it("never offers a second answer that is also right", () => {
    const alphabet = getAlphabetMappings();
    for (const name of NAMES) {
      for (const q of questions(name)) {
        q.options.forEach((option, i) => {
          if (i === q.answer) return;
          if (q.kind === "sign") {
            expect(option).not.toBe(q.glyph);
          } else {
            // No wrong letter may be written with the sign on show.
            const glyphs = alphabet.filter((m) => m.input.toUpperCase() === option).map((m) => m.glyph);
            expect(glyphs).not.toContain(q.glyph);
          }
        });
      }
    }
  });

  it("keeps a C sign-first and never sets K or S against it", () => {
    const alphabet = getAlphabetMappings();
    const kAndS = alphabet.filter((m) => ["k", "q", "s", "z"].includes(m.input)).map((m) => m.glyph);
    for (const name of ["Cecil", "Coco", "Marcia", "Cy"]) {
      for (const q of questions(name)) {
        if (q.subject !== "C") continue;
        expect(q.kind).toBe("sign");
        q.options.forEach((option, i) => {
          if (i !== q.answer) expect(kAndS).not.toContain(option);
        });
      }
    }
  });

  it("says where the sign sits in their name", () => {
    const q = questions("Noah")[0];
    expect(q.reveal).toContain("in Noah");
    expect(q.reveal).toContain(q.glyph);
  });

  it("has nothing to ask about an empty name", () => {
    expect(nameQuestions("", [])).toEqual([]);
    expect(questions("123")).toEqual([]);
  });
});

describe("chartQuestion", () => {
  const chart: ChartSign[] = UNILITERALS.map((g) => ({
    glyph: g.symbol,
    english: ENGLISH_EQUIVALENT[g.symbol],
    name: g.meaning.split(/: | — /)[0],
  }));

  it("covers all 25 signs with an English sound each", () => {
    expect(chart.length).toBe(25);
    for (const s of chart) expect(s.english).toBeTruthy();
  });

  it("offers four sounds from four different families", () => {
    const random = seededRandom("chart");
    for (let round = 0; round < 8; round++) {
      for (const sign of chart) {
        const q = chartQuestion(sign, chart, random);
        expect(q.options.length).toBe(4);
        expect(q.options[q.answer]).toBe(sign.english);
        expect(new Set(q.options.map(soundFamily)).size).toBe(4);
      }
    }
  });

  it("treats the look-alike sounds as one family", () => {
    expect(soundFamily("h (breathy)")).toBe(soundFamily("h"));
    expect(soundFamily("q, c (hard)")).toBe(soundFamily("k"));
    expect(soundFamily("kh (loch)")).toBe(soundFamily("kh (soft)"));
    expect(soundFamily("y (ee)")).toBe(soundFamily("i, e"));
    expect(soundFamily("a (deep)")).toBe(soundFamily("a"));
  });
});
