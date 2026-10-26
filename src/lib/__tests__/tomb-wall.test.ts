import { describe, it, expect } from "vitest";
import {
  WALL_WORDS,
  ASYMMETRIC_GLYPHS,
  hasDirectionClue,
  directionClueSign,
  determinativeIndex,
  buildRounds,
  makeRound,
  expectedSlot,
  scoreRound,
  xpForGame,
  shuffle,
  ROUNDS,
  ORDER_POINTS,
  DET_POINTS,
  MAX_SPEED_BONUS,
  MAX_GAME_XP,
  SPEED_WINDOW_MS,
} from "@/lib/tomb-wall";

/** Deterministic LCG so tests never flake. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const HIERO_BLOCK = [0x13000, 0x1345f];

describe("WALL_WORDS data integrity", () => {
  it("has unique ids and at least 20 words", () => {
    const ids = new Set(WALL_WORDS.map((w) => w.id));
    expect(ids.size).toBe(WALL_WORDS.length);
    expect(WALL_WORDS.length).toBeGreaterThanOrEqual(20);
  });

  it("every sign is a single Egyptian Hieroglyphs code point", () => {
    for (const w of WALL_WORDS) {
      for (const sg of w.signs) {
        const cps = Array.from(sg.glyph).map((c) => c.codePointAt(0)!);
        expect(cps, `${w.id}: ${sg.name}`).toHaveLength(1);
        expect(cps[0]).toBeGreaterThanOrEqual(HIERO_BLOCK[0]);
        expect(cps[0]).toBeLessThanOrEqual(HIERO_BLOCK[1]);
      }
    }
  });

  it("every word has exactly one determinative, and it comes last", () => {
    for (const w of WALL_WORDS) {
      const dets = w.signs.filter((s) => s.role === "det");
      expect(dets, w.id).toHaveLength(1);
      expect(determinativeIndex(w), w.id).toBe(w.signs.length - 1);
    }
  });

  it("every word has 2–6 signs and a teaching note", () => {
    for (const w of WALL_WORDS) {
      expect(w.signs.length, w.id).toBeGreaterThanOrEqual(2);
      expect(w.signs.length, w.id).toBeLessThanOrEqual(6);
      expect(w.note.length, w.id).toBeGreaterThan(20);
      expect(w.meaning.length, w.id).toBeGreaterThan(0);
      expect(w.translit.length, w.id).toBeGreaterThan(0);
    }
  });

  it("every word has a direction clue (an asymmetric sign) so RTL rounds are fair", () => {
    for (const w of WALL_WORDS) {
      expect(hasDirectionClue(w), `${w.id} needs an asymmetric sign`).toBe(true);
      expect(directionClueSign(w)).not.toBeNull();
    }
  });

  it("asymmetric set holds whole code points (no split surrogates)", () => {
    for (const g of ASYMMETRIC_GLYPHS) {
      expect(Array.from(g)).toHaveLength(1);
      expect(g.codePointAt(0)!).toBeGreaterThanOrEqual(HIERO_BLOCK[0]);
    }
  });
});

describe("rounds", () => {
  it("makeRound lays out LTR in sign order and RTL reversed", () => {
    const w = WALL_WORDS[0];
    const n = w.signs.length;
    expect(makeRound(w, false).display).toEqual([...Array(n).keys()]);
    expect(makeRound(w, true).display).toEqual([...Array(n).keys()].reverse());
  });

  it("expectedSlot maps reading steps to display slots", () => {
    const w = WALL_WORDS.find((x) => x.signs.length === 4)!;
    const ltr = makeRound(w, false);
    const rtl = makeRound(w, true);
    expect([0, 1, 2, 3].map((s) => expectedSlot(ltr, s))).toEqual([0, 1, 2, 3]);
    expect([0, 1, 2, 3].map((s) => expectedSlot(rtl, s))).toEqual([3, 2, 1, 0]);
  });

  it("buildRounds gives ROUNDS distinct words with a mix of directions", () => {
    const rounds = buildRounds(WALL_WORDS, ROUNDS, seeded(7));
    expect(rounds).toHaveLength(ROUNDS);
    const ids = new Set(rounds.map((r) => r.word.id));
    expect(ids.size).toBe(ROUNDS);
    const rtlCount = rounds.filter((r) => r.rtl).length;
    expect(rtlCount).toBe(ROUNDS / 2);
  });

  it("buildRounds repeats words only once the pool is exhausted", () => {
    const small = WALL_WORDS.slice(0, 3);
    const rounds = buildRounds(small, 6, seeded(3));
    const firstThree = new Set(rounds.slice(0, 3).map((r) => r.word.id));
    expect(firstThree.size).toBe(3);
  });

  it("shuffle is a permutation", () => {
    const out = shuffle([1, 2, 3, 4, 5], seeded(1));
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("scoring", () => {
  it("perfect, instant, hint-free round scores the maximum for streak 0", () => {
    const r = scoreRound({ orderMistakes: 0, detCorrect: true, elapsedMs: 0, streak: 0 });
    expect(r.points).toBe(ORDER_POINTS + DET_POINTS + MAX_SPEED_BONUS);
    expect(r.perfect).toBe(true);
    expect(r.streak).toBe(1);
  });

  it("speed bonus decays to zero over the window", () => {
    const slow = scoreRound({ orderMistakes: 0, detCorrect: true, elapsedMs: SPEED_WINDOW_MS, streak: 0 });
    expect(slow.points).toBe(ORDER_POINTS + DET_POINTS);
    const half = scoreRound({ orderMistakes: 0, detCorrect: true, elapsedMs: SPEED_WINDOW_MS / 2, streak: 0 });
    expect(half.points).toBe(ORDER_POINTS + DET_POINTS + MAX_SPEED_BONUS / 2);
  });

  it("hint forfeits the speed bonus but keeps the rest", () => {
    const r = scoreRound({ orderMistakes: 0, detCorrect: true, elapsedMs: 0, streak: 2, hintUsed: true });
    expect(r.points).toBe(ORDER_POINTS + DET_POINTS + 20);
    expect(r.perfect).toBe(true);
  });

  it("mistakes reduce order points and reset the streak", () => {
    const one = scoreRound({ orderMistakes: 1, detCorrect: true, elapsedMs: 0, streak: 4 });
    expect(one.points).toBe(60 + DET_POINTS);
    expect(one.perfect).toBe(false);
    expect(one.streak).toBe(0);
    const many = scoreRound({ orderMistakes: 5, detCorrect: false, elapsedMs: 0, streak: 4 });
    expect(many.points).toBe(30);
  });

  it("streak bonus is capped", () => {
    const r = scoreRound({ orderMistakes: 0, detCorrect: true, elapsedMs: SPEED_WINDOW_MS, streak: 9 });
    expect(r.points).toBe(ORDER_POINTS + DET_POINTS + 50);
    expect(r.streak).toBe(10);
  });

  it("xpForGame scales and caps", () => {
    expect(xpForGame(0)).toBe(0);
    expect(xpForGame(850)).toBe(85);
    expect(xpForGame(99_999)).toBe(MAX_GAME_XP);
  });
});
