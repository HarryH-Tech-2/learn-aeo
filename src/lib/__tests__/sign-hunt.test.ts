import { describe, it, expect } from "vitest";
import {
  SIGN_OBJECTS,
  buildRounds,
  scoreAnswer,
  xpForGame,
  shuffle,
  ROUNDS,
  OPTIONS_PER_ROUND,
  BASE_POINTS,
  MAX_TIME_BONUS,
  MAX_GAME_XP,
} from "@/lib/sign-hunt";

// deterministic rng
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("SIGN_OBJECTS", () => {
  it("has unique ids and glyphs and model paths under /models/signs", () => {
    const ids = new Set(SIGN_OBJECTS.map((o) => o.id));
    const glyphs = new Set(SIGN_OBJECTS.map((o) => o.glyph));
    expect(ids.size).toBe(SIGN_OBJECTS.length);
    expect(glyphs.size).toBe(SIGN_OBJECTS.length);
    for (const o of SIGN_OBJECTS) expect(o.model).toBe(`/models/signs/${o.id}.glb`);
  });
});

describe("buildRounds", () => {
  it("builds the requested number of rounds with 4 distinct options containing the target", () => {
    const rounds = buildRounds(SIGN_OBJECTS, ROUNDS, seeded(1));
    expect(rounds).toHaveLength(ROUNDS);
    for (const r of rounds) {
      expect(r.options).toHaveLength(OPTIONS_PER_ROUND);
      expect(new Set(r.options.map((o) => o.id)).size).toBe(OPTIONS_PER_ROUND);
      expect(r.options.some((o) => o.id === r.target.id)).toBe(true);
    }
  });

  it("does not repeat a target before every object has been used", () => {
    const rounds = buildRounds(SIGN_OBJECTS, SIGN_OBJECTS.length, seeded(7));
    const targets = rounds.map((r) => r.target.id);
    expect(new Set(targets).size).toBe(SIGN_OBJECTS.length);
  });

  it("cycles when more rounds than objects are requested", () => {
    const rounds = buildRounds(SIGN_OBJECTS.slice(0, 4), 9, seeded(3));
    expect(rounds).toHaveLength(9);
  });

  it("throws with fewer than two objects", () => {
    expect(() => buildRounds(SIGN_OBJECTS.slice(0, 1), 3)).toThrow();
  });
});

describe("scoreAnswer", () => {
  it("gives 0 and resets streak on a wrong answer", () => {
    expect(scoreAnswer({ correct: false, msLeft: 5000, streak: 4 })).toEqual({ points: 0, streak: 0 });
  });

  it("gives base + full time bonus for an instant correct answer with no streak", () => {
    expect(scoreAnswer({ correct: true, msLeft: 12000, roundMs: 12000, streak: 0 })).toEqual({
      points: BASE_POINTS + MAX_TIME_BONUS,
      streak: 1,
    });
  });

  it("gives base only when time has run out, and increments streak", () => {
    expect(scoreAnswer({ correct: true, msLeft: 0, streak: 2 })).toEqual({
      points: BASE_POINTS + 20,
      streak: 3,
    });
  });

  it("caps the streak bonus", () => {
    const a = scoreAnswer({ correct: true, msLeft: 0, streak: 5 }).points;
    const b = scoreAnswer({ correct: true, msLeft: 0, streak: 50 }).points;
    expect(a).toBe(b);
  });

  it("forfeits the speed bonus when a hint was used but keeps base + streak", () => {
    expect(scoreAnswer({ correct: true, msLeft: 12000, streak: 2, hintUsed: true })).toEqual({
      points: BASE_POINTS + 20,
      streak: 3,
    });
  });

  it("clamps msLeft above roundMs", () => {
    expect(scoreAnswer({ correct: true, msLeft: 99999, roundMs: 1000, streak: 0 }).points).toBe(
      BASE_POINTS + MAX_TIME_BONUS
    );
  });
});

describe("xpForGame", () => {
  it("is ~points/10, capped and never negative", () => {
    expect(xpForGame(0)).toBe(0);
    expect(xpForGame(1234)).toBe(123);
    expect(xpForGame(99999)).toBe(MAX_GAME_XP);
    expect(xpForGame(-5)).toBe(0);
  });
});

describe("shuffle", () => {
  it("is a permutation and does not mutate input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seeded(9));
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
