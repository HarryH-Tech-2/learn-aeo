import { describe, it, expect } from "vitest";
import {
  DAILY_CARTOUCHES,
  MAX_ATTEMPTS,
  TILE_COUNT,
  EMPTY_STATS,
  buildShareText,
  buildTileBank,
  cartoucheForPuzzle,
  dateForPuzzle,
  pastPuzzles,
  currentStreak,
  isSolved,
  msUntilNextPuzzle,
  puzzleNumberFor,
  recordResult,
  scoreGuess,
  seededShuffle,
  shareGrid,
  uniqueValues,
  xpForDaily,
} from "../daily";

const HIERO = /^[\u{13000}-\u{1345F}]+$/u;

describe("catalogue", () => {
  it("has unique ids and only hieroglyph code points", () => {
    const ids = new Set(DAILY_CARTOUCHES.map((c) => c.id));
    expect(ids.size).toBe(DAILY_CARTOUCHES.length);
    for (const c of DAILY_CARTOUCHES) {
      expect(c.signs.length).toBeGreaterThan(1);
      for (const s of c.signs) {
        expect(s.glyph, `${c.id} ${s.gardiner}`).toMatch(HIERO);
        expect(s.value.length).toBeGreaterThan(0);
        expect(s.gardiner).toMatch(/^[A-Z][a-z]?\d+[A-Z]?$/);
      }
    }
  });

  it("has every difficulty band populated", () => {
    for (const d of [1, 2, 3]) {
      expect(DAILY_CARTOUCHES.some((c) => c.difficulty === d)).toBe(true);
    }
  });
});

describe("puzzle numbering", () => {
  it("launch day is #1 and counts up by local date", () => {
    expect(puzzleNumberFor(new Date(2026, 8, 8, 0, 0, 1))).toBe(1);
    expect(puzzleNumberFor(new Date(2026, 8, 8, 23, 59, 59))).toBe(1);
    expect(puzzleNumberFor(new Date(2026, 8, 9, 0, 0, 0))).toBe(2);
    expect(puzzleNumberFor(new Date(2026, 9, 8))).toBe(31);
  });

  it("counts down to local midnight", () => {
    const ms = msUntilNextPuzzle(new Date(2026, 8, 8, 23, 0, 0));
    expect(ms).toBe(60 * 60 * 1000);
  });
});

describe("seeding", () => {
  it("is deterministic", () => {
    expect(cartoucheForPuzzle(5).id).toBe(cartoucheForPuzzle(5).id);
    expect(seededShuffle([1, 2, 3, 4, 5], 9)).toEqual(seededShuffle([1, 2, 3, 4, 5], 9));
  });

  it("never repeats inside one cycle and starts easy", () => {
    const len = DAILY_CARTOUCHES.length;
    const ids = Array.from({ length: len }, (_, i) => cartoucheForPuzzle(i + 1).id);
    expect(new Set(ids).size).toBe(len);
    expect(cartoucheForPuzzle(1).difficulty).toBe(1);
    // second cycle also covers everything
    const ids2 = Array.from({ length: len }, (_, i) => cartoucheForPuzzle(len + i + 1).id);
    expect(new Set(ids2).size).toBe(len);
  });
});

describe("tile bank", () => {
  it("contains every needed value plus decoys, deterministically", () => {
    for (const c of DAILY_CARTOUCHES) {
      const bank = buildTileBank(c, 3);
      for (const v of uniqueValues(c.signs)) expect(bank).toContain(v);
      expect(new Set(bank).size).toBe(bank.length);
      expect(bank.length).toBe(Math.max(TILE_COUNT, uniqueValues(c.signs).length));
      expect(bank).toEqual(buildTileBank(c, 3));
    }
  });
});

describe("scoring", () => {
  const signs = cartoucheForPuzzle(1).signs; // deterministic
  const khufu = DAILY_CARTOUCHES.find((c) => c.id === "khufu")!.signs; // ḫ w f w

  it("marks correct, present and absent", () => {
    expect(scoreGuess(["ḫ", "w", "f", "w"], khufu)).toEqual(["correct", "correct", "correct", "correct"]);
    expect(scoreGuess(["w", "ḫ", "f", "s"], khufu)).toEqual(["present", "present", "correct", "absent"]);
  });

  it("does not over-mark duplicated guesses", () => {
    // only one w unsolved after the second slot is correct
    expect(scoreGuess(["w", "w", "w", "s"], khufu)).toEqual(["present", "correct", "absent", "absent"]);
  });

  it("isSolved", () => {
    expect(isSolved(scoreGuess(signs.map((s) => s.value), signs))).toBe(true);
    expect(isSolved([])).toBe(false);
  });
});

describe("xp", () => {
  it("rewards fewer rows and penalises hints", () => {
    expect(xpForDaily(1, true, 0)).toBe(85);
    expect(xpForDaily(4, true, 0)).toBe(40);
    expect(xpForDaily(1, true, 2)).toBe(65);
    expect(xpForDaily(4, false, 0)).toBe(10);
  });
});

describe("streak", () => {
  it("builds on consecutive wins and resets on a miss or a gap", () => {
    let s = recordResult(EMPTY_STATS, 1, true, 2);
    expect(s.streak).toBe(1);
    s = recordResult(s, 2, true, 1);
    expect(s.streak).toBe(2);
    expect(s.distribution).toEqual([1, 1, 0, 0]);
    expect(recordResult(s, 2, false, 4)).toBe(s); // same day twice: no-op
    const gap = recordResult(s, 4, true, 3);
    expect(gap.streak).toBe(1);
    expect(gap.maxStreak).toBe(2);
    const miss = recordResult(s, 3, false, MAX_ATTEMPTS);
    expect(miss.streak).toBe(0);
    expect(miss.played).toBe(3);
    expect(miss.won).toBe(2);
  });

  it("lapses when yesterday was skipped", () => {
    const s = recordResult(EMPTY_STATS, 10, true, 1);
    expect(currentStreak(s, 11)).toBe(1);
    expect(currentStreak(s, 12)).toBe(0);
  });
});

describe("share text", () => {
  it("renders the grid", () => {
    expect(shareGrid([["correct", "present", "absent"]])).toBe("🟩🟨⬛");
    const text = buildShareText({
      puzzleNumber: 7,
      rows: [
        ["present", "absent"],
        ["correct", "correct"],
      ],
      won: true,
    });
    expect(text).toBe("Cartouche of the Day #7 · 2/4\n🟨⬛\n🟩🟩\nhttps://www.learnhieroglyphics.com/daily");
    expect(buildShareText({ puzzleNumber: 7, rows: [["absent"]], won: false, hintsUsed: 1 })).toContain("X/4 🔍");
  });
});

describe("archive", () => {
  it("dates each puzzle from the launch day", () => {
    expect(dateForPuzzle(1).toISOString().slice(0, 10)).toBe("2026-09-08");
    expect(dateForPuzzle(44).toISOString().slice(0, 10)).toBe("2026-10-21");
    expect(puzzleNumberFor(new Date(2026, 9, 21, 12))).toBe(44);
  });
  it("lists the days before today, newest first", () => {
    expect(pastPuzzles(4)).toEqual([3, 2, 1]);
    expect(pastPuzzles(1)).toEqual([]);
  });
});
