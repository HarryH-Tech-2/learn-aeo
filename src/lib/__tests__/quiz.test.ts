import { describe, it, expect } from "vitest";
import {
  generateQuestions,
  checkAnswer,
  type Question,
  type QuestionType,
} from "@/lib/quiz";

const sampleGlyphs = [
  {
    symbol: "𓄿",
    transliteration: "3 (aleph)",
    meaning: "Egyptian vulture — glottal stop consonant",
    pronunciation: "ah",
    history: "",
    culture: "",
    examples: [],
  },
  {
    symbol: "𓇋",
    transliteration: "j (yod)",
    meaning: "Reed leaf — semi-vowel",
    pronunciation: "ee",
    history: "",
    culture: "",
    examples: [],
  },
  {
    symbol: "𓂝",
    transliteration: "ꜥ (ayin)",
    meaning: "Arm — pharyngeal fricative",
    pronunciation: "ah (guttural)",
    history: "",
    culture: "",
    examples: [],
  },
  {
    symbol: "𓅱",
    transliteration: "w",
    meaning: "Quail chick — semi-vowel",
    pronunciation: "oo / w",
    history: "",
    culture: "",
    examples: [],
  },
  {
    symbol: "𓃀",
    transliteration: "b",
    meaning: "Foot — bilabial stop",
    pronunciation: "b as in boy",
    history: "",
    culture: "",
    examples: [],
  },
];

describe("generateQuestions", () => {
  it("returns exactly 5 questions", () => {
    const questions = generateQuestions(sampleGlyphs);
    expect(questions).toHaveLength(5);
  });

  it("each question has required fields", () => {
    const questions = generateQuestions(sampleGlyphs);
    for (const q of questions) {
      expect(q.type).toBeDefined();
      expect(["symbol-to-meaning", "meaning-to-symbol", "transliteration"]).toContain(q.type);
      expect(q.correctAnswer).toBeDefined();
      expect(q.prompt).toBeDefined();
      if (q.type !== "transliteration") {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBe(4);
        expect(q.options).toContain(q.correctAnswer);
      }
    }
  });

  it("multiple-choice options contain no duplicates", () => {
    const questions = generateQuestions(sampleGlyphs);
    for (const q of questions) {
      if (q.options) {
        const unique = new Set(q.options);
        expect(unique.size).toBe(q.options.length);
      }
    }
  });

  it("returns fewer questions if fewer than 5 glyphs (edge case: 3 glyphs)", () => {
    const questions = generateQuestions(sampleGlyphs.slice(0, 3));
    expect(questions.length).toBeLessThanOrEqual(3);
    expect(questions.length).toBeGreaterThan(0);
  });
});

describe("checkAnswer", () => {
  it("returns true for exact match", () => {
    expect(checkAnswer("transliteration", "3 (aleph)", "3 (aleph)")).toBe(true);
  });

  it("returns true for case-insensitive match on transliteration", () => {
    expect(checkAnswer("transliteration", "W", "w")).toBe(true);
  });

  it("returns true for trimmed match on transliteration", () => {
    expect(checkAnswer("transliteration", "  w  ", "w")).toBe(true);
  });

  it("returns false for wrong answer", () => {
    expect(checkAnswer("transliteration", "b", "w")).toBe(false);
  });

  it("returns true for exact match on multiple choice", () => {
    expect(checkAnswer("symbol-to-meaning", "Egyptian vulture — glottal stop consonant", "Egyptian vulture — glottal stop consonant")).toBe(true);
  });

  it("returns false for wrong multiple choice", () => {
    expect(checkAnswer("symbol-to-meaning", "Reed leaf — semi-vowel", "Egyptian vulture — glottal stop consonant")).toBe(false);
  });
});
