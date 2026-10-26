import { describe, it, expect } from "vitest";
import { doorForName, nameFirstGroups, DEFAULT_DOOR_NAME, MAX_DOOR_CELLS } from "@/lib/content/door-name";
import { UNILITERAL_GROUPS } from "@/lib/content/uniliterals";

const all = UNILITERAL_GROUPS.flatMap((g) => g.glyphs);
const sym = (d: ReturnType<typeof doorForName>) => d.cells.map((c) => c.glyph.symbol).join("");

describe("doorForName", () => {
  it("spells a name with lesson signs, letters attached", () => {
    const d = doorForName("Harry", all);
    expect(d.name).toBe("Harry");
    expect(sym(d)).toBe("𓉔𓄿𓂋𓇋"); // h a r (rr collapses) y→reed
    expect(d.cells.map((c) => c.letter)).toEqual(["h", "a", "r", "y"]);
    expect(d.signs.map((g) => g.symbol)).toEqual(["𓉔", "𓄿", "𓂋", "𓇋"]);
  });

  it("uses only the first name and keeps repeats as separate cells", () => {
    const d = doorForName("  Anna Smith ", all);
    expect(d.name).toBe("Anna");
    expect(sym(d)).toBe("𓄿𓈖𓄿");
    expect(d.signs).toHaveLength(2); // distinct signs only
  });

  it("splits a two-sign letter into two cells", () => {
    const d = doorForName("Max", all);
    expect(sym(d)).toBe("𓅓𓄿𓎡𓋴");
    expect(d.cells.map((c) => c.letter)).toEqual(["m", "a", "k", "s"]);
  });

  it("falls back to Khufu when there is no usable name", () => {
    for (const bad of ["", "   ", "123", null, undefined]) {
      const d = doorForName(bad, all);
      expect(d.name).toBe(DEFAULT_DOOR_NAME);
      expect(sym(d)).toBe("𓐍𓅱𓆑𓅱");
      expect(d.signs.map((g) => g.symbol)).toEqual(["𓐍", "𓅱", "𓆑"]);
    }
  });

  it("caps very long names at the lintel's width", () => {
    const d = doorForName("Bartholomewsonsmithson", all);
    expect(d.cells.length).toBe(MAX_DOOR_CELLS);
  });

  it("every cell carries a note", () => {
    for (const c of doorForName("Sophie", all).cells) expect(c.note.length).toBeGreaterThan(10);
  });
});

describe("nameFirstGroups", () => {
  it("puts the door's signs first and removes them from later groups", () => {
    const d = doorForName("Harry", all);
    const groups = nameFirstGroups(UNILITERAL_GROUPS, d.signs);
    expect(groups[0].glyphs).toEqual(d.signs);
    const later = groups.slice(1).flatMap((g) => g.glyphs.map((h) => h.symbol));
    for (const s of d.signs) expect(later).not.toContain(s.symbol);
    // nothing lost, nothing duplicated
    expect(groups.flatMap((g) => g.glyphs).length).toBe(all.length);
  });

  it("leaves the groups alone with no door signs", () => {
    expect(nameFirstGroups(UNILITERAL_GROUPS, [])).toBe(UNILITERAL_GROUPS);
  });
});
