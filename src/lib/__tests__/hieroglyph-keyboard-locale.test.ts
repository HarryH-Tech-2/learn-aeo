import { describe, it, expect } from "vitest";
import { KEY_SIGNS, appendKey, foldKey, keySigns, signForKey, typedToHieroglyphs } from "@/lib/hieroglyph-keyboard";
import { KEYBOARD_STRINGS, keyRows, localizedSign } from "@/lib/hieroglyph-keyboard-i18n";

describe("hieroglyph keyboard in Spanish and French", () => {
  it("leaves English exactly as it was: A–Z only", () => {
    expect(keySigns("en")).toEqual(KEY_SIGNS);
    for (const k of ["é", "ñ", "ç"]) expect(signForKey(k, "en"), k).toBeNull();
  });

  it("types accented letters as their plain letter, and ç as s", () => {
    expect(signForKey("é", "fr")).toBe(signForKey("e", "fr"));
    expect(signForKey("À", "fr")).toBe(signForKey("a", "fr"));
    expect(signForKey("ñ", "es")).toBe(signForKey("n", "es"));
    expect(signForKey("ü", "es")).toBe(signForKey("u", "es"));
    expect(signForKey("ç", "fr")).toBe(signForKey("s", "fr"));
    expect(foldKey("Ê", "fr")).toBe("e");
    expect(signForKey("œ", "fr")).toBeNull();
    expect(signForKey("1", "es")).toBeNull();
  });

  it("gives Spanish J the placenta (ḫ, as in jamón) and keeps the cobra in English and French", () => {
    expect(signForKey("j", "es")!.gardiner).toBe("Aa1");
    expect(signForKey("j", "es")!.glyph).toBe("\u{1340D}");
    expect(signForKey("j", "fr")!.gardiner).toBe("I10");
    expect(signForKey("j", "en")!.gardiner).toBe("I10");
    expect(keySigns("es").find((s) => s.input === "j")!.gardiner).toBe("Aa1");
  });

  it("stores folded keys, so the wall and the copied text agree", () => {
    let typed: string[] = [];
    for (const k of ["J", "o", "s", "é"]) typed = appendKey(typed, k, "es");
    expect(typed).toEqual(["j", "o", "s", "e"]);
    expect(typedToHieroglyphs(typed, "es")).toBe(["\u{1340D}", signForKey("o")!.glyph, signForKey("s")!.glyph, signForKey("e")!.glyph].join(""));
  });

  it("has a name and a note in each language for every key", () => {
    for (const locale of ["es", "fr"] as const) {
      for (const s of keySigns(locale)) {
        const text = localizedSign(s, s.input, locale);
        // (cobra and placenta are spelled the same in all three languages)
        if (!["Cobra", "Placenta"].includes(s.signName)) expect(text.signName, `${locale} ${s.input}`).not.toBe(s.signName);
        expect(text.note, `${locale} ${s.input}`).not.toBe(s.note);
      }
    }
  });

  it("lays out the on-screen keys as AZERTY for French, all 26 letters either way", () => {
    expect(keyRows("fr")[0].slice(0, 2)).toEqual(["a", "z"]);
    for (const locale of ["en", "es", "fr"] as const) {
      const keys = keyRows(locale).flat();
      expect(new Set(keys).size, locale).toBe(26);
      expect(KEYBOARD_STRINGS[locale].copy.length, locale).toBeGreaterThan(0);
    }
  });
});
