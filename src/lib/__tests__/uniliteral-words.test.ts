import { describe, it, expect } from "vitest";
import { WORDS, buildWordGroups, doorLessonGroups, knownBefore } from "@/lib/content/uniliteral-words";
import { UNILITERAL_GROUPS } from "@/lib/content/uniliterals";
import { doorForName } from "@/lib/content/door-name";

const all = UNILITERAL_GROUPS.flatMap((g) => g.glyphs);
const alphabet = new Set(all.map((g) => g.symbol));

describe("WORDS", () => {
  it("cover every one of the 25 alphabet signs", () => {
    const covered = new Set(WORDS.flatMap((w) => w.core));
    for (const s of alphabet) expect(covered.has(s), `missing ${s}`).toBe(true);
  });

  it("only use alphabet signs in the core spelling", () => {
    for (const w of WORDS) for (const s of w.core) expect(alphabet.has(s), `${w.id} uses non-alphabet ${s}`).toBe(true);
  });

  it("each word has a reading, a reason and a story", () => {
    for (const w of WORDS) {
      expect(w.say.length).toBeGreaterThan(1);
      expect(w.why.length).toBeGreaterThan(40);
      expect(w.story.length).toBeGreaterThan(60);
    }
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
  });

  it("no word introduces more than two new signs when read in order", () => {
    const seen = new Set<string>();
    for (const w of WORDS) {
      const fresh = w.core.filter((s) => !seen.has(s));
      expect(fresh.length, `${w.id} introduces ${fresh.join("")}`).toBeLessThanOrEqual(2);
      w.core.forEach((s) => seen.add(s));
    }
  });
});

describe("buildWordGroups", () => {
  it("introduces each sign exactly once, skipping what the door taught", () => {
    const door = doorForName("Harry", all);
    const groups = buildWordGroups(door.signs.map((g) => g.symbol), all);
    const introduced = groups.flatMap((g) => g.glyphs.map((h) => h.symbol));
    expect(new Set(introduced).size).toBe(introduced.length);
    for (const s of door.signs) expect(introduced).not.toContain(s.symbol);
    expect(new Set([...introduced, ...door.signs.map((g) => g.symbol)]).size).toBe(25);
  });

  it("opens on a short set of three, then sets of five and six", () => {
    const groups = buildWordGroups([], all);
    expect(groups.map((g) => g.words.length)).toEqual([3, 5, 5, 6]);
  });
});

describe("doorLessonGroups / knownBefore", () => {
  it("puts the door signs first and mirrors the word groups", () => {
    const door = doorForName("Khufu", all);
    const { groups, wordGroups } = doorLessonGroups(door.signs, all, "img");
    expect(groups[0].glyphs).toEqual(door.signs);
    expect(groups.length).toBe(wordGroups.length + 1);
    expect(groups.flatMap((g) => g.glyphs).length).toBe(25);
  });

  it("knownBefore grows word by word", () => {
    const door = doorForName("", all); // falls back to Khufu: ḫ w f
    const wg = buildWordGroups(door.signs.map((g) => g.symbol), all);
    const k0 = knownBefore(door.signs.map((g) => g.symbol), wg, 0, 0);
    expect(k0.size).toBe(3);
    const k1 = knownBefore(door.signs.map((g) => g.symbol), wg, 0, 1);
    expect(k1.has("𓂋")).toBe(true); // rn taught r and n
    expect(k1.has("𓈖")).toBe(true);
    const k2 = knownBefore(door.signs.map((g) => g.symbol), wg, 1, 0);
    for (const w of wg[0].words) for (const s of w.core) expect(k2.has(s)).toBe(true);
  });
});
