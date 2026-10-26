import type { Hieroglyph, ExerciseConfig, FillInBlankConfig } from "@/lib/lessons";
import { typedAnswer } from "@/lib/transliteration";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- Matching Pairs ---
export type MatchingPair = { symbol: string; meaning: string };

export function generateMatchingPairs(glyphs: Hieroglyph[]): MatchingPair[] {
  const selected = shuffle(glyphs).slice(0, Math.min(4, glyphs.length));
  return selected.map((g) => ({ symbol: g.symbol, meaning: g.meaning }));
}

// --- Fill in the Blank ---
// The sentence shows each sign and the learner supplies what it says (its sound or its meaning)
// from a bank of words. It used to ask for the signs themselves, which the sentence had just printed.
export type FillInBlankExercise = {
  inscription: string;
  /** what goes in each ___, in order */
  answers: string[];
  wordBank: string[];
};

export function generateFillInBlank(config: FillInBlankConfig): FillInBlankExercise {
  return {
    inscription: config.inscription,
    answers: config.answers,
    wordBank: shuffle([...config.answers, ...config.distractors]),
  };
}

// --- Decode Inscription ---
export type DecodeQuestion = {
  glyphSequence: string[];
  correctTranslation: string;
  mode: "multiple-choice" | "free-text";
  options?: string[];
};

export function generateDecodeQuestion(
  glyphs: Hieroglyph[],
  mode: "multiple-choice" | "free-text"
): DecodeQuestion {
  const count = Math.min(2 + Math.floor(Math.random() * 2), glyphs.length);
  const selected = shuffle(glyphs).slice(0, count);
  const glyphSequence = selected.map((g) => g.symbol);
  const correctTranslation = selected.map((g) => g.meaning).join(" + ");

  const result: DecodeQuestion = { glyphSequence, correctTranslation, mode };

  if (mode === "multiple-choice") {
    const wrong = Array.from({ length: 3 }, () =>
      shuffle(glyphs)
        .slice(0, count)
        .map((g) => g.meaning)
        .join(" + ")
    ).filter((t) => t !== correctTranslation);
    result.options = shuffle([correctTranslation, ...wrong.slice(0, 3)]);
  }

  return result;
}

// --- Site Report (mixed assessment) ---
export type SiteReportQuestion =
  | { type: "symbol-to-meaning"; prompt: string; correctAnswer: string; options: string[] }
  | { type: "meaning-to-symbol"; prompt: string; correctAnswer: string; options: string[] }
  | { type: "transliteration"; prompt: string; correctAnswer: string }
  | { type: "fill-in-blank"; exercise: FillInBlankExercise }
  | { type: "decode"; question: DecodeQuestion };

export function generateSiteReport(
  glyphs: Hieroglyph[],
  config: Pick<ExerciseConfig, "decodeAvailable" | "fillInBlanks">
): SiteReportQuestion[] {
  const questions: SiteReportQuestion[] = [];
  const shuffledGlyphs = shuffle(glyphs);

  // 3 symbol-to-meaning
  for (let i = 0; i < Math.min(3, shuffledGlyphs.length); i++) {
    const g = shuffledGlyphs[i];
    const wrong = shuffle(glyphs.filter((x) => x.symbol !== g.symbol))
      .slice(0, 3)
      .map((x) => x.meaning);
    questions.push({
      type: "symbol-to-meaning",
      prompt: g.symbol,
      correctAnswer: g.meaning,
      options: shuffle([g.meaning, ...wrong]),
    });
  }

  // 2 meaning-to-symbol
  for (let i = 3; i < Math.min(5, shuffledGlyphs.length); i++) {
    const g = shuffledGlyphs[i % shuffledGlyphs.length];
    const wrong = shuffle(glyphs.filter((x) => x.symbol !== g.symbol))
      .slice(0, 3)
      .map((x) => x.symbol);
    questions.push({
      type: "meaning-to-symbol",
      prompt: g.meaning,
      correctAnswer: g.symbol,
      options: shuffle([g.symbol, ...wrong]),
    });
  }

  // 1 transliteration, of a sign with a sound to type (not a determinative's "(det.)")
  const tGlyph = [...shuffledGlyphs].reverse().find((g) => typedAnswer(g.transliteration));
  if (tGlyph) {
    questions.push({
      type: "transliteration",
      prompt: tGlyph.symbol,
      correctAnswer: tGlyph.transliteration,
    });
  }

  // 1 fill-in-blank
  if (config.fillInBlanks.length > 0) {
    const fillConfig = config.fillInBlanks[0];
    questions.push({
      type: "fill-in-blank",
      exercise: generateFillInBlank(fillConfig),
    });
  }

  // 1-2 decode (if available)
  if (config.decodeAvailable) {
    questions.push({
      type: "decode",
      question: generateDecodeQuestion(glyphs, "multiple-choice"),
    });
  }

  return shuffle(questions).slice(0, 10);
}
