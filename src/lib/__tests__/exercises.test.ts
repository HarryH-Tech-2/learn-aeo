import { describe, it, expect } from "vitest";
import {
  generateMatchingPairs,
  generateFillInBlank,
  generateDecodeQuestion,
  generateSiteReport,
} from "@/lib/exercises";
import { lessons, type Hieroglyph } from "@/lib/legacy-lessons";

const testGlyphs: Hieroglyph[] = [
  { symbol: "𓄿", transliteration: "3 (aleph)", meaning: "Egyptian vulture", pronunciation: "ah", history: "", culture: "", examples: [] },
  { symbol: "𓇋", transliteration: "j (yod)", meaning: "Reed leaf", pronunciation: "ee", history: "", culture: "", examples: [] },
  { symbol: "𓂝", transliteration: "ꜥ (ayin)", meaning: "Arm", pronunciation: "ah (guttural)", history: "", culture: "", examples: [] },
  { symbol: "𓅱", transliteration: "w", meaning: "Quail chick", pronunciation: "oo", history: "", culture: "", examples: [] },
  { symbol: "𓃀", transliteration: "b", meaning: "Foot", pronunciation: "b", history: "", culture: "", examples: [] },
  { symbol: "𓊪", transliteration: "p", meaning: "Stool", pronunciation: "p", history: "", culture: "", examples: [] },
];

describe("generateMatchingPairs", () => {
  it("returns pairs of glyphs and meanings", () => {
    const pairs = generateMatchingPairs(testGlyphs.slice(0, 4));
    expect(pairs).toHaveLength(4);
    for (const pair of pairs) {
      expect(pair.symbol).toBeDefined();
      expect(pair.meaning).toBeDefined();
    }
  });

  it("caps at 4 pairs maximum", () => {
    const pairs = generateMatchingPairs(testGlyphs);
    expect(pairs.length).toBeLessThanOrEqual(4);
  });
});

describe("generateFillInBlank", () => {
  it("keeps the answers in gap order and banks them with the distractors", () => {
    const exercise = generateFillInBlank({ inscription: "The vulture writes ___ and the reed ___", answers: ["ꜣ", "ꞽ"], distractors: ["ꜥ", "w"] });
    expect(exercise.answers).toEqual(["ꜣ", "ꞽ"]);
    expect([...exercise.wordBank].sort()).toEqual(["w", "ꜣ", "ꜥ", "ꞽ"].sort());
  });
});

describe("lesson fill-in-blanks", () => {
  it("have one answer per gap, and no answer printed in the sentence", () => {
    for (const lesson of lessons) {
      for (const f of lesson.exerciseConfig.fillInBlanks) {
        expect(f.inscription.split("___").length - 1, lesson.id).toBe(f.answers.length);
        for (const answer of f.answers) expect(f.inscription.includes(answer), `${lesson.id}: ${answer}`).toBe(false);
        expect(new Set([...f.answers, ...f.distractors]).size, lesson.id).toBe(f.answers.length + f.distractors.length);
      }
    }
  });
});

describe("generateSiteReport transliteration", () => {
  it("never asks to type a determinative's label", () => {
    const dets = testGlyphs.map((g) => ({ ...g, transliteration: "(det.)" }));
    for (let i = 0; i < 20; i++) {
      const report = generateSiteReport(dets, { decodeAvailable: false, fillInBlanks: [] });
      expect(report.some((q) => q.type === "transliteration")).toBe(false);
    }
  });
});

describe("generateDecodeQuestion", () => {
  it("returns a sequence of glyphs with expected translation", () => {
    const question = generateDecodeQuestion(testGlyphs.slice(0, 3), "multiple-choice");
    expect(question.glyphSequence.length).toBeGreaterThanOrEqual(2);
    expect(question.correctTranslation).toBeDefined();
    expect(question.mode).toBe("multiple-choice");
  });

  it("free-text mode has no options", () => {
    const question = generateDecodeQuestion(testGlyphs.slice(0, 3), "free-text");
    expect(question.mode).toBe("free-text");
    expect(question.options).toBeUndefined();
  });
});

describe("generateSiteReport", () => {
  it("returns 8-10 mixed questions", () => {
    const report = generateSiteReport(testGlyphs, {
      decodeAvailable: true,
      fillInBlanks: [{ inscription: "The ___", answers: ["sun"], distractors: ["moon"] }],
    });
    expect(report.length).toBeGreaterThanOrEqual(8);
    expect(report.length).toBeLessThanOrEqual(10);
  });

  it("includes multiple exercise types", () => {
    const report = generateSiteReport(testGlyphs, {
      decodeAvailable: true,
      fillInBlanks: [{ inscription: "The ___", answers: ["sun"], distractors: ["moon"] }],
    });
    const types = new Set(report.map((q) => q.type));
    expect(types.size).toBeGreaterThanOrEqual(2);
  });
});
