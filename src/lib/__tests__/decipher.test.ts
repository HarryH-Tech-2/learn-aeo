import { describe, it, expect } from "vitest";
import {
  CHAPTERS,
  EMPTY_PROGRESS,
  TOTAL_CHAPTERS,
  allUnlockableSigns,
  checkPlacement,
  clearSlot,
  initialPlacement,
  isChapterOpen,
  isComplete,
  isProgress,
  mergeProgress,
  nextChapter,
  openSlots,
  placeLetter,
  signInfo,
  signsUnlockedBy,
  tilesFor,
  withChapterComplete,
  withPuzzleSolved,
  xpForChapter,
} from "../decipher";

const HIERO = /^[\u{13000}-\u{1345F}]+$/u;
const ptolemy = CHAPTERS[0].puzzles[0];
const cleopatra = CHAPTERS[1].puzzles[0];
const ramesses = CHAPTERS[3].puzzles[0];

describe("chapter data", () => {
  it("has five chapters, numbered in order, with hieroglyph-only glyphs", () => {
    expect(TOTAL_CHAPTERS).toBe(5);
    CHAPTERS.forEach((ch, i) => {
      expect(ch.number).toBe(i + 1);
      for (const p of ch.puzzles) for (const s of p.signs) expect(s.glyph, `${p.id} ${s.gardiner}`).toMatch(HIERO);
      for (const r of ch.reading ?? []) {
        expect(r.glyphs).toMatch(HIERO);
        expect(r.options).toContain(r.answer);
        expect(new Set(r.options).size).toBe(r.options.length);
      }
    });
  });

  it("unlocks 21 distinct signs across the campaign", () => {
    expect(allUnlockableSigns().length).toBe(21);
  });

  it("the homophone quiz has exactly one right answer", () => {
    const quiz = CHAPTERS[1].quiz!;
    expect(quiz.options.filter((o) => o.correct).length).toBe(1);
    expect(quiz.options.find((o) => o.correct)!.text).toMatch(/same sound/);
  });

  it("chapter 5 reads only unlocked signs", () => {
    const unlocked = new Set(allUnlockableSigns());
    for (const r of CHAPTERS[4].reading!) {
      for (const g of r.glyphs) expect(unlocked.has(g), `${r.id} ${g}`).toBe(true);
    }
  });
});

describe("placement", () => {
  it("Ptolemy starts empty and offers the seven letters sorted", () => {
    const none = new Set<string>();
    expect(initialPlacement(ptolemy, none)).toEqual([null, null, null, null, null, null, null]);
    expect(tilesFor(ptolemy, none)).toEqual(["I", "L", "M", "O", "P", "S", "T"]);
  });

  it("Cleopatra pre-fills the signs unlocked from Ptolemy and never the ending", () => {
    const unlocked = new Set(signsUnlockedBy(ptolemy));
    const start = initialPlacement(cleopatra, unlocked);
    expect(start).toEqual([null, "L", null, "O", "P", null, null, null, null, null, null]);
    expect(openSlots(cleopatra, unlocked)).toEqual([0, 2, 5, 6, 7, 8]);
    expect(tilesFor(cleopatra, unlocked)).toEqual(["A", "A", "E", "K", "R", "T"]);
  });

  it("places into the first open slot, displaces, clears and checks", () => {
    const unlocked = new Set(signsUnlockedBy(ptolemy));
    let row = initialPlacement(cleopatra, unlocked);
    ({ placement: row } = placeLetter(cleopatra, row, "K", null, unlocked));
    expect(row[0]).toBe("K");
    ({ placement: row } = placeLetter(cleopatra, row, "E", null, unlocked));
    expect(row[2]).toBe("E");
    const r = placeLetter(cleopatra, row, "A", 2, unlocked);
    expect(r.displaced).toBe("E");
    expect(r.placement[2]).toBe("A");
    // prefilled slots cannot be overwritten or cleared
    expect(placeLetter(cleopatra, row, "X", 1, unlocked).placement[1]).toBe("L");
    expect(clearSlot(cleopatra, row, 1, unlocked)[1]).toBe("L");
    expect(clearSlot(cleopatra, row, 0, unlocked)[0]).toBeNull();
    expect(isComplete(cleopatra, row)).toBe(false);
    for (const [i, l] of [[5, "A"], [6, "T"], [7, "R"], [8, "A"]] as const) ({ placement: row } = placeLetter(cleopatra, row, l, i, unlocked));
    expect(isComplete(cleopatra, row)).toBe(true);
    expect(checkPlacement(cleopatra, row).allCorrect).toBe(true);
    const wrong = [...row];
    wrong[0] = "R";
    wrong[7] = "K";
    const res = checkPlacement(cleopatra, wrong);
    expect(res.allCorrect).toBe(false);
    expect(res.correct[0]).toBe(false);
    expect(res.correct[7]).toBe(false);
    expect(res.correct[9]).toBe(true); // ending is never wrong
  });

  it("Ramesses pre-fills the two s and asks for RA and MS", () => {
    const unlocked = new Set([...signsUnlockedBy(ptolemy), ...signsUnlockedBy(cleopatra)]);
    expect(initialPlacement(ramesses, unlocked)).toEqual([null, null, "S", "S"]);
    expect(tilesFor(ramesses, unlocked)).toEqual(["MS", "RA"]);
  });

  it("signInfo finds a sign's first teaching", () => {
    expect(signInfo("𓃭")?.name).toBe("lion");
    expect(signInfo("𓀀")).toBeUndefined();
  });
});

describe("progress", () => {
  it("opens chapters in order and merges records", () => {
    let p = EMPTY_PROGRESS;
    expect(nextChapter(p)).toBe(1);
    expect(isChapterOpen(p, 1)).toBe(true);
    expect(isChapterOpen(p, 2)).toBe(false);
    p = withPuzzleSolved(p, ptolemy);
    expect(p.unlocked.length).toBe(7);
    expect(p.solved).toEqual(["ptolemy"]);
    p = withChapterComplete(p, 1);
    expect(nextChapter(p)).toBe(2);
    expect(isChapterOpen(p, 2)).toBe(true);
    const other = withChapterComplete(withPuzzleSolved(EMPTY_PROGRESS, cleopatra), 2);
    const merged = mergeProgress(p, other);
    expect(merged.completed).toEqual([1, 2]);
    expect(merged.unlocked.length).toBe(13);
    expect(isProgress(merged)).toBe(true);
    expect(isProgress({ completed: "no" })).toBe(false);
    expect(nextChapter(withChapterComplete(merged, 3))).toBe(4);
  });

  it("xp grows with new signs and the finale bonus", () => {
    expect(xpForChapter(CHAPTERS[0], 7)).toBe(95);
    expect(xpForChapter(CHAPTERS[4], 0)).toBe(100);
  });
});
