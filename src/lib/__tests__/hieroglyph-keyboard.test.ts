import { describe, it, expect } from "vitest";
import { KEY_ROWS, KEY_SIGNS, MAX_TYPED, appendKey, signForKey, typedToHieroglyphs, wrapTyped } from "@/lib/hieroglyph-keyboard";
import { getHieroglyphs } from "@/lib/hieroglyph-translator";

describe("hieroglyph keyboard", () => {
  it("has a sign for every letter key, each a real hieroglyph", () => {
    const keys = KEY_ROWS.flat();
    expect(keys).toHaveLength(26);
    expect(new Set(keys).size).toBe(26);
    expect(KEY_SIGNS.map((s) => s.input).join("")).toBe("abcdefghijklmnopqrstuvwxyz");
    for (const k of keys) {
      const sign = signForKey(k);
      expect(sign, k).not.toBeNull();
      expect(sign!.glyph, k).toMatch(/^[\u{13000}-\u{1342F}]+$/u);
    }
  });

  it("reads upper and lower case alike, and ignores everything that is not a letter", () => {
    expect(signForKey("M")).toBe(signForKey("m"));
    for (const k of ["1", " ", "é", "Enter", "Shift", ""]) expect(signForKey(k), k).toBeNull();
  });

  it("agrees with the name translator letter by letter", () => {
    for (const k of KEY_ROWS.flat()) expect(signForKey(k)!.glyph, k).toBe(getHieroglyphs(k));
  });

  it("types one sign per key, with no leading or doubled spaces, up to the cap", () => {
    let typed: string[] = [];
    for (const k of [" ", "N", "i", "l", "e", " ", " ", "7", "s"]) typed = appendKey(typed, k);
    expect(typed).toEqual(["n", "i", "l", "e", " ", "s"]);
    expect(typedToHieroglyphs(typed)).toBe(`${getHieroglyphs("nile")} ${getHieroglyphs("s")}`);
    let full: string[] = [];
    for (let i = 0; i < MAX_TYPED + 10; i++) full = appendKey(full, "a");
    expect(full).toHaveLength(MAX_TYPED);
  });

  it("wraps at spaces, and splits a word only when it is longer than a line", () => {
    expect(wrapTyped([..."the nile"], 20)).toEqual([[..."the nile"]]);
    expect(wrapTyped([..."the nile"], 5)).toEqual([[..."the"], [..."nile"]]);
    expect(wrapTyped([..."abcdefg hi"], 3)).toEqual([[..."abc"], [..."def"], [..."g"], [..."hi"]]);
    expect(wrapTyped([], 5)).toEqual([]);
  });
});
