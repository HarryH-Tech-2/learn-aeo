/**
 * Fading Paint — the sign catalogue and the quick questions asked when a
 * faded sign is tapped. Pure; the canvas lives in the page component.
 */
import { lessons, getLessonGlyphs, type Hieroglyph } from "@/lib/lessons";
import { seededRandom } from "@/lib/daily";

export type WallSign = {
  glyph: string;
  translit: string;
  /** short meaning, e.g. "Egyptian vulture" */
  name: string;
  pronunciation: string;
  lessonId: string;
  lessonOrder: number;
};

export const WALL_LESSON_ID = "game-wall";
export const FREE_LESSON_ID = "expedition-begins";

/** Door bolt z and folded cloth s had merged by the Middle Kingdom: as answers they count as one sound. */
export function soundKey(translit: string): string {
  return translit === "z" ? "s" : translit;
}

/** A silent sign (determinative, plural or dual marker) has a label like "(det.)" instead of a sound. */
export function isSilent(sign: WallSign): boolean {
  return sign.translit.startsWith("(");
}

function shortMeaning(meaning: string): string {
  return meaning.split(/: | — | – /)[0].trim();
}

/** Every teachable sign on the site, first lesson that introduces it wins. */
export function buildCatalogue(): WallSign[] {
  const seen = new Set<string>();
  const out: WallSign[] = [];
  for (const l of [...lessons].sort((a, b) => a.order - b.order)) {
    for (const g of getLessonGlyphs(l) as Hieroglyph[]) {
      if (seen.has(g.symbol)) continue;
      seen.add(g.symbol);
      out.push({ glyph: g.symbol, translit: g.transliteration, name: shortMeaning(g.meaning), pronunciation: g.pronunciation, lessonId: l.id, lessonOrder: l.order });
    }
  }
  return out;
}

let cached: WallSign[] | null = null;
export function catalogue(): WallSign[] {
  return (cached ??= buildCatalogue());
}

export function signInfo(glyph: string): WallSign | undefined {
  return catalogue().find((s) => s.glyph === glyph);
}

/** Glyphs a learner should have on the wall: lesson 1 always, plus every completed lesson. */
export function glyphsForLearner(completedLessonIds: string[], paid: boolean): string[] {
  const allowed = new Set<string>([FREE_LESSON_ID, ...(paid ? completedLessonIds : [])]);
  return catalogue()
    .filter((s) => allowed.has(s.lessonId))
    .map((s) => s.glyph);
}

export type QuestionKind = "sound" | "meaning" | "pick";

export type Question = {
  kind: QuestionKind;
  glyph: string;
  prompt: string;
  /** option labels (glyphs for "pick") */
  options: string[];
  answer: number;
  /** shown after answering */
  explain: string;
};

/** Main words of a sign's name, so "Water" and "Ripple of water" are never offered against each other. */
function nameWords(name: string): string[] {
  return name.toLowerCase().match(/[a-z]{4,}/g) ?? [];
}

function pickOthers(sign: WallSign, n: number, rnd: () => number, key: (s: WallSign) => string, clash?: (s: WallSign) => boolean): WallSign[] {
  const pool = catalogue().filter((s) => s.glyph !== sign.glyph && key(s) !== key(sign) && !clash?.(s));
  // prefer signs from the same lesson so the distractors are plausible
  const same = pool.filter((s) => s.lessonId === sign.lessonId);
  const rest = pool.filter((s) => s.lessonId !== sign.lessonId);
  const shuffled = [...shuffle(same, rnd), ...shuffle(rest, rnd)];
  const out: WallSign[] = [];
  const used = new Set<string>();
  for (const s of shuffled) {
    const k = key(s);
    if (used.has(k)) continue;
    used.add(k);
    out.push(s);
    if (out.length === n) break;
  }
  return out;
}

function shuffle<T>(items: T[], rnd: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a four-option question about `glyph`. `seed` makes it reproducible
 * (tests); pass Date.now() in the game.
 */
export function makeQuestion(glyph: string, seed: number, kind?: QuestionKind): Question | null {
  const sign = signInfo(glyph);
  if (!sign) return null;
  const rnd = seededRandom(seed);
  let k: QuestionKind = kind ?? (["sound", "meaning", "pick"] as const)[Math.floor(rnd() * 3)];
  // a silent sign has no sound to ask about, and "which sign is read (det.)?" would have several right answers
  if (isSilent(sign)) k = "meaning";
  if (k === "sound") {
    const others = pickOthers(sign, 3, rnd, (s) => soundKey(s.translit));
    const opts = shuffle([sign, ...others], rnd);
    return {
      kind: k,
      glyph,
      prompt: "What sound does this sign write?",
      options: opts.map((s) => s.translit),
      answer: opts.indexOf(sign),
      explain: `${sign.translit}: ${sign.name}, said “${sign.pronunciation}”.`,
    };
  }
  if (k === "meaning") {
    const words = nameWords(sign.name);
    const others = pickOthers(sign, 3, rnd, (s) => s.name, (s) => nameWords(s.name).some((w) => words.includes(w)));
    const opts = shuffle([sign, ...others], rnd);
    return {
      kind: k,
      glyph,
      prompt: "What does this sign show?",
      options: opts.map((s) => s.name),
      answer: opts.indexOf(sign),
      explain: `${sign.name}, read ${sign.translit}.`,
    };
  }
  const others = pickOthers(sign, 3, rnd, (s) => soundKey(s.translit), isSilent);
  const opts = shuffle([sign, ...others], rnd);
  return {
    kind: k,
    glyph,
    prompt: `Which sign is read ${sign.translit}?`,
    options: opts.map((s) => s.glyph),
    answer: opts.indexOf(sign),
    explain: `${sign.translit} is the ${sign.name.toLowerCase()}.`,
  };
}

export function xpForRepaint(quality: number): number {
  return quality >= 4 ? 10 : quality === 3 ? 6 : 0;
}
