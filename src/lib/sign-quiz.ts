/**
 * One-tap sign questions for the free tool pages (2026-10-10).
 *
 * Visitors to the name translator and the alphabet chart came for a result, not a course: of 133
 * who saw the "Start Lesson 1" banner there in 1–9 Oct 2026, 3 clicked. So the first step of the
 * lesson now happens on the page itself, on the thing they just made:
 *   - translator: "read it back" (src/components/ReadItBack.tsx), up to three questions on the
 *     signs of the name they typed;
 *   - alphabet chart: a self-test (src/components/AlphabetSelfTest.tsx) through the 25 signs.
 * Only after answering are they asked for an account.
 *
 * Everything here is pure. The name questions are seeded by the name, so the server and the
 * browser draw the same ones for a shared link (/translate-name-to-hieroglyphics/<name>).
 */
import { getAlphabetMappings, type TransliterationResult } from "@/lib/hieroglyph-translator";
import { distinctSigns } from "@/lib/translator-bridge";

export type QuizQuestion = {
  /** "sign": pick the hieroglyph for a letter or sound. "sound": pick the sound a hieroglyph writes. */
  kind: "sign" | "sound";
  /** The hieroglyph the question is about. */
  glyph: string;
  /** What is asked: the letter(s) for "sign", the hieroglyph for "sound". */
  subject: string;
  options: string[];
  /** Index of the right option. */
  answer: number;
  /** One line shown once they have answered, right or wrong. */
  reveal: string;
};

export const READ_BACK_MAX = 3;
const OPTION_COUNT = 4;

/** A small seeded generator (mulberry32), so a name always draws the same questions. */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Right answer plus distractors, shuffled; returns the options and where the right one landed. */
function arrange(correct: string, distractors: string[], random: () => number): { options: string[]; answer: number } {
  const options = shuffled([correct, ...distractors.slice(0, OPTION_COUNT - 1)], random);
  return { options, answer: options.indexOf(correct) };
}

/**
 * Letters that could fairly be argued to write the same sound as `input`, so they are never
 * offered as wrong answers beside it: a C is a K or an S depending on the name.
 */
const SOUND_ALIKES: Record<string, string[]> = {
  c: ["k", "q", "s", "z"],
  k: ["c", "q"],
  q: ["c", "k"],
  s: ["c", "z"],
  z: ["s", "c"],
  e: ["i", "y"],
  i: ["e", "y"],
  y: ["e", "i"],
  o: ["u", "w"],
  u: ["o", "w"],
  w: ["o", "u"],
  f: ["v", "ph"],
  v: ["f", "ph"],
  ph: ["f", "v"],
  l: ["r"],
  r: ["l"],
};

/**
 * Up to three questions on the signs of a translated name, alternating "which sign writes the N?"
 * with "which sound is this sign?". A one-sign name gets one question.
 */
export function nameQuestions(name: string, results: TransliterationResult[], max = READ_BACK_MAX): QuizQuestion[] {
  const signs = distinctSigns(results);
  if (signs.length === 0) return [];
  const shown = name.trim();
  const random = seededRandom(shown.toLowerCase());
  const alphabet = getAlphabetMappings();
  const asked = shuffled(signs, random).slice(0, max);

  return asked.map((sign, i) => {
    const input = sign.input;
    const letter = input.toUpperCase();
    const alikes = new Set([input, ...(SOUND_ALIKES[input] ?? [])]);
    // Every sign a sound-alike letter could be written with is off the table as a wrong answer.
    const barredGlyphs = new Set([sign.mapping.glyph, ...alphabet.filter((m) => alikes.has(m.input)).map((m) => m.glyph)]);
    const signName = sign.mapping.signName.toLowerCase();
    // A soft C sounds like S and a hard one like K, so it is only ever asked sign-first.
    const kind: QuizQuestion["kind"] = i % 2 === 1 && input !== "c" ? "sound" : "sign";

    if (kind === "sign") {
      // The other signs of their own name come first as wrong answers: that is reading it back.
      const fromName = shuffled(signs.filter((s) => !barredGlyphs.has(s.mapping.glyph)).map((s) => s.mapping.glyph), random);
      const fromAlphabet = shuffled([...new Set(alphabet.map((m) => m.glyph))].filter((g) => !barredGlyphs.has(g)), random);
      const distractors = [...new Set([...fromName.slice(0, 2), ...fromAlphabet])];
      return {
        kind,
        glyph: sign.mapping.glyph,
        subject: letter,
        ...arrange(sign.mapping.glyph, distractors, random),
        reveal: `${sign.mapping.glyph} is the ${signName}. It writes the ${letter} in ${shown}.`,
      };
    }

    const letters = shuffled(
      [...new Set(alphabet.filter((m) => !barredGlyphs.has(m.glyph) && !alikes.has(m.input)).map((m) => m.input.toUpperCase()))],
      random,
    );
    // Two letters that share a sign (O and U) must not both appear: only one could be "wrong".
    const glyphOf = new Map(alphabet.map((m) => [m.input.toUpperCase(), m.glyph]));
    const seen = new Set<string>();
    const distractors = letters.filter((l) => {
      const g = glyphOf.get(l) ?? l;
      if (seen.has(g)) return false;
      seen.add(g);
      return true;
    });
    return {
      kind,
      glyph: sign.mapping.glyph,
      subject: sign.mapping.glyph,
      ...arrange(letter, distractors, random),
      reveal: `${sign.mapping.glyph} is the ${signName}. It writes the ${letter} in ${shown}.`,
    };
  });
}

/** A sign of the alphabet chart, as the self-test needs it. */
export type ChartSign = {
  glyph: string;
  /** Closest English letter(s), as the chart prints them: "f, v", "kh (loch)". */
  english: string;
  /** What the picture shows: "Horned viper". */
  name: string;
};

/**
 * Signs whose English sounds are too close to tell apart in a quiz (the two h's, k and q, the
 * reed and the double reed) share a family, and a question never offers two of one family.
 */
export function soundFamily(english: string): string {
  const first = english.trim().charAt(0).toLowerCase();
  if (first === "q") return "k";
  // z (door bolt) and s (folded cloth) had merged by the Middle Kingdom
  if (first === "z") return "s";
  if (first === "y") return "i";
  return first;
}

/** "Which sound does this sign write?" for one sign of the chart, with three fair wrong answers. */
export function chartQuestion(sign: ChartSign, all: readonly ChartSign[], random: () => number): QuizQuestion {
  const family = soundFamily(sign.english);
  const families = new Set([family]);
  const distractors: string[] = [];
  for (const other of shuffled(all, random)) {
    const f = soundFamily(other.english);
    if (families.has(f)) continue;
    families.add(f);
    distractors.push(other.english);
  }
  return {
    kind: "sound",
    glyph: sign.glyph,
    subject: sign.glyph,
    ...arrange(sign.english, distractors, random),
    reveal: `${sign.glyph} is the ${sign.name.toLowerCase()}: ${sign.english}.`,
  };
}

/**
 * "Learn 3 more signs right here" (2026-10-16): after reading their own name back, the next step is
 * three signs that are NOT in it, taught and asked on the page, so the account ask comes after the
 * learner has started on the rest of the alphabet rather than straight after one success. GA4 for the
 * translator in the 28 days to 2026-10-16: 68 answered, 41 finished, 4 clicked the result's sign-up
 * button. Shown by src/components/ReadItBack.tsx.
 */
export const MORE_SIGNS = 3;

/** One sign taught in the mini-lesson. */
export type NewSign = {
  glyph: string;
  /** What the picture shows: "Owl". */
  depicts: string;
  /** The sound as a learner should say it: "m", "kh, as in loch". */
  sound: string;
  /** The answer in a "which sound?" question, and the subject of a "which sign writes…?" one: "M". */
  letter: string;
  /** The translator's note on the sign. */
  note: string;
  /** Signs of one family sound too alike to teach or ask side by side (k/q, h/kh, d/dj). */
  family: string;
};

/**
 * The signs the mini-lesson can teach, most useful and most memorable first. `input` picks the
 * translator mapping whose note is used. One entry per glyph of the translator's table.
 */
const TEACHABLE: { input: string; letter: string; sound: string; family: string }[] = [
  { input: "m", letter: "M", sound: "m", family: "m" },
  { input: "n", letter: "N", sound: "n", family: "n" },
  { input: "r", letter: "R", sound: "r (and l)", family: "r" },
  { input: "b", letter: "B", sound: "b", family: "b" },
  { input: "f", letter: "F", sound: "f (and v)", family: "f" },
  { input: "t", letter: "T", sound: "t", family: "t" },
  { input: "w", letter: "W", sound: "w (and o, u)", family: "w" },
  { input: "s", letter: "S", sound: "s (and z)", family: "s" },
  { input: "a", letter: "A", sound: "a", family: "a" },
  { input: "i", letter: "I", sound: "i (and e, y)", family: "i" },
  { input: "d", letter: "D", sound: "d", family: "d" },
  { input: "k", letter: "K", sound: "k (and a hard c)", family: "k" },
  { input: "p", letter: "P", sound: "p", family: "p" },
  { input: "h", letter: "H", sound: "h", family: "h" },
  { input: "g", letter: "G", sound: "g, as in go", family: "g" },
  { input: "sh", letter: "SH", sound: "sh", family: "sh" },
  { input: "j", letter: "J", sound: "dj, like the j in jar", family: "d" },
  { input: "q", letter: "Q", sound: "q, a k said further back", family: "k" },
  { input: "ch", letter: "KH", sound: "kh, as in loch", family: "h" },
];

/** The first this many eligible signs are the pool a name's three are drawn from; the rest are a fallback. */
const MORE_POOL = 7;

function teachable(): NewSign[] {
  const byInput = new Map(getAlphabetMappings().map((m) => [m.input, m]));
  return TEACHABLE.map((t) => {
    const m = byInput.get(t.input)!;
    return { glyph: m.glyph, depicts: m.signName, sound: t.sound, letter: t.letter, note: m.note, family: t.family };
  });
}

/**
 * Three signs of the alphabet that are not in the name, for the mini-lesson after the read-back.
 * Never a sign the name already uses (a two-sign letter like X counts as both of its signs), never
 * one that sounds like a sign of the name (a K name is not taught the Q), and never two of one
 * sound family. Seeded by the name, so a name always gets the same three. Fewer than three only
 * when the name already uses nearly every sign.
 */
export function moreSigns(name: string, results: TransliterationResult[], count = MORE_SIGNS): NewSign[] {
  const all = teachable();
  const familyOf = new Map(all.map((s) => [s.glyph, s.family]));
  const nameGlyphs = new Set(distinctSigns(results).flatMap((r) => [r.mapping.glyph, ...Array.from(r.mapping.glyph)]));
  const families = new Set([...nameGlyphs].map((g) => familyOf.get(g)).filter((f): f is string => !!f));
  const eligible = all.filter((s) => !nameGlyphs.has(s.glyph) && !families.has(s.family));
  const random = seededRandom(`more:${name.trim().toLowerCase()}`);
  const order = [...shuffled(eligible.slice(0, MORE_POOL), random), ...eligible.slice(MORE_POOL)];

  const picked: NewSign[] = [];
  for (const s of order) {
    if (picked.length >= count) break;
    if (picked.some((p) => p.family === s.family)) continue;
    picked.push(s);
  }
  return picked;
}

/**
 * One question per new sign, alternating "which sign writes the M?" with "which sound is this
 * sign?". Wrong answers never share a sound family with the right one; on sign questions the
 * other new signs and the signs of the name come first, so the whole card is revision.
 */
export function moreSignQuestions(name: string, results: TransliterationResult[], signs: NewSign[]): QuizQuestion[] {
  const all = teachable();
  const random = seededRandom(`more-q:${name.trim().toLowerCase()}`);
  const nameGlyphs = distinctSigns(results)
    .map((r) => r.mapping.glyph)
    .filter((g) => all.some((s) => s.glyph === g));

  return signs.map((sign, i) => {
    const reveal = `${sign.glyph} is the ${sign.depicts.toLowerCase()}: ${sign.sound}.`;
    const fair = all.filter((s) => s.family !== sign.family);
    if (i % 2 === 0) {
      const fairGlyphs = new Set(fair.map((s) => s.glyph));
      const known = shuffled(
        [...signs.filter((s) => s !== sign).map((s) => s.glyph), ...nameGlyphs].filter((g) => fairGlyphs.has(g)),
        random,
      );
      const rest = shuffled(fair.map((s) => s.glyph), random);
      const distractors = [...new Set([...known.slice(0, 2), ...rest])];
      return { kind: "sign", glyph: sign.glyph, subject: sign.letter, ...arrange(sign.glyph, distractors, random), reveal };
    }
    const distractors = shuffled(fair.map((s) => s.letter), random);
    return { kind: "sound", glyph: sign.glyph, subject: sign.glyph, ...arrange(sign.letter, distractors, random), reveal };
  });
}
