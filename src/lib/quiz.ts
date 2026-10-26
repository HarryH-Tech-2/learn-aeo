export type QuestionType =
  | "symbol-to-meaning"
  | "meaning-to-symbol"
  | "transliteration";

export type Question = {
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
};

type Glyph = {
  symbol: string;
  transliteration: string;
  meaning: string;
  pronunciation: string;
};

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickWrongAnswers(
  correct: string,
  pool: string[],
  count: number
): string[] {
  const wrong = pool.filter((item) => item !== correct);
  return shuffle(wrong).slice(0, count);
}

function makeSymbolToMeaning(glyph: Glyph, allGlyphs: Glyph[]): Question {
  const wrongAnswers = pickWrongAnswers(
    glyph.meaning,
    allGlyphs.map((g) => g.meaning),
    3
  );
  return {
    type: "symbol-to-meaning",
    prompt: glyph.symbol,
    correctAnswer: glyph.meaning,
    options: shuffle([glyph.meaning, ...wrongAnswers]),
  };
}

function makeMeaningToSymbol(glyph: Glyph, allGlyphs: Glyph[]): Question {
  const wrongAnswers = pickWrongAnswers(
    glyph.symbol,
    allGlyphs.map((g) => g.symbol),
    3
  );
  return {
    type: "meaning-to-symbol",
    prompt: glyph.meaning,
    correctAnswer: glyph.symbol,
    options: shuffle([glyph.symbol, ...wrongAnswers]),
  };
}

function makeTransliteration(glyph: Glyph): Question {
  return {
    type: "transliteration",
    prompt: glyph.symbol,
    correctAnswer: glyph.transliteration,
  };
}

const questionMakers = [
  makeSymbolToMeaning,
  makeMeaningToSymbol,
  makeTransliteration,
] as const;

export function generateQuestions(glyphs: Glyph[]): Question[] {
  const count = Math.min(5, glyphs.length);
  const selectedGlyphs = shuffle(glyphs).slice(0, count);

  return selectedGlyphs.map((glyph, i) => {
    const maker = questionMakers[i % questionMakers.length];
    if (maker === makeTransliteration) {
      return makeTransliteration(glyph);
    }
    return maker(glyph, glyphs);
  });
}

export function checkAnswer(
  type: QuestionType,
  userAnswer: string,
  correctAnswer: string
): boolean {
  if (type === "transliteration") {
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }
  return userAnswer === correctAnswer;
}
