import { describe, it, expect } from "vitest";
import {
  getAlphabetMappings,
  transliterateName,
  getHieroglyphs,
  getTransliteration,
} from "@/lib/hieroglyph-translator";

/**
 * Unicode code point for each Gardiner sign the translator uses. These match
 * the audited values in src/lib/content/uniliterals.ts (Lesson 1), so the
 * translator, the lessons and the classroom worksheet all draw the same sign.
 */
const GARDINER_CODEPOINT: Record<string, number> = {
  G1: 0x1313f, // vulture
  M17: 0x131cb, // reed
  G43: 0x13171, // quail chick
  D58: 0x130c0, // foot
  Q3: 0x132aa, // stool / mat
  I9: 0x13191, // horned viper
  G17: 0x13153, // owl
  N35: 0x13216, // water ripple
  D21: 0x1308b, // mouth
  O4: 0x13254, // reed shelter
  Aa1: 0x1340d, // placenta / sieve
  S29: 0x132f4, // folded cloth
  O34: 0x13283, // door bolt
  V13: 0x133ff, // tethering rope
  N37: 0x13219, // pool
  N29: 0x1320e, // hill slope
  V31: 0x133a1, // basket with handle
  W11: 0x133bc, // jar stand
  X1: 0x133cf, // bread loaf
  D46: 0x130a7, // hand
  I10: 0x13193, // cobra
};

describe("hieroglyph translator sign table", () => {
  it("renders the Unicode character that matches each mapping's Gardiner code", () => {
    const wrong: string[] = [];
    for (const m of getAlphabetMappings()) {
      const codes = m.gardiner.split("+");
      const chars = Array.from(m.glyph);
      expect(chars.length, `${m.input} glyph count`).toBe(codes.length);
      codes.forEach((code, i) => {
        const expected = GARDINER_CODEPOINT[code];
        expect(expected, `unknown Gardiner code ${code} for '${m.input}'`).toBeDefined();
        if (chars[i].codePointAt(0) !== expected) {
          wrong.push(`${m.input} (${code}): got U+${chars[i].codePointAt(0)!.toString(16).toUpperCase()}`);
        }
      });
    }
    expect(wrong).toEqual([]);
  });

  it("covers a–z plus the sh/ch/th/ph digraphs", () => {
    const inputs = getAlphabetMappings().map((m) => m.input);
    for (const letter of "abcdefghijklmnopqrstuvwxyz") expect(inputs).toContain(letter);
    for (const d of ["sh", "ch", "th", "ph"]) expect(inputs).toContain(d);
  });
});

describe("transliterateName", () => {
  it("maps digraphs before single letters", () => {
    expect(transliterateName("sha").map((r) => r.input)).toEqual(["sh", "a"]);
  });
  it("collapses doubled consonants but keeps doubled vowels", () => {
    expect(transliterateName("harry").map((r) => r.input)).toEqual(["h", "a", "r", "y"]);
    expect(transliterateName("aa").map((r) => r.input)).toEqual(["a", "a"]);
  });
  it("uses a soft c before e/i/y", () => {
    expect(transliterateName("cy")[0].mapping.transliteration).toBe("s");
    expect(transliterateName("ca")[0].mapping.transliteration).toBe("k");
  });
  it("produces the classic Egyptological reading for a name", () => {
    expect(getTransliteration("Harry")).toBe("h-ꜣ-r-j");
    expect(getHieroglyphs("Tut")).toBe("\u{133CF}\u{13171}\u{133CF}");
  });
});

const translit = (name: string, locale: "en" | "es" | "fr" = "en") => getTransliteration(name, locale);
const inputs = (name: string, locale: "en" | "es" | "fr") => transliterateName(name, locale).map((r) => r.input);

describe("accented names", () => {
  it("keeps accented letters instead of dropping them", () => {
    expect(translit("José")).toBe("ḏ-w-s-j");
    expect(translit("Zoë")).toBe("z-w-j");
    expect(translit("Éléonore")).toBe(translit("Eleonore"));
  });
  it("folds ß, æ, œ, ç and ñ to the letters they sound like", () => {
    expect(translit("Weiß")).toBe(translit("Weiss"));
    expect(translit("Æsa")).toBe(translit("Aesa"));
    expect(translit("Françoise")).toBe(translit("Fransoise"));
    expect(translit("Peña")).toBe(translit("Penya"));
  });
  it("ignores digits, spaces and punctuation", () => {
    expect(translit("Ann-Marie 2")).toBe(translit("annmarie"));
  });
  it("leaves English spelling unchanged by default", () => {
    expect(getTransliteration("Harry")).toBe("h-ꜣ-r-j");
    expect(translit("Charles")).toBe("ṯ-ꜣ-r-r-j-s");
    expect(translit("Chris")).toBe("k-r-j-s");
  });
});

describe("Spanish spelling (locale es)", () => {
  it("writes j as the guttural ḫ: José, Javier", () => {
    expect(translit("José", "es")).toBe("ḫ-w-s-j");
    expect(translit("Javier", "es")).toBe("ḫ-ꜣ-b-j-j-r");
  });
  it("reads g before e/i as ḫ and gu before e/i as hard g: Jorge, Guillermo", () => {
    expect(translit("Jorge", "es")).toBe("ḫ-w-r-ḫ-j");
    expect(inputs("Guillermo", "es")).toEqual(["gu", "i", "ll", "e", "r", "m", "o"]);
    expect(translit("Guillermo", "es")).toBe("g-j-j-j-r-m-w");
  });
  it("keeps ñ as n + y: Begoña", () => {
    const r = transliterateName("Begoña", "es");
    expect(r.map((x) => x.input)).toEqual(["b", "e", "g", "o", "ñ", "a"]);
    expect(r[4].mapping.transliteration).toBe("nj");
    expect(r[4].mapping.glyph).toBe("\u{13216}\u{131CB}");
  });
  it("makes h silent, v a b, z and soft c an s, qu a k, ch a sh", () => {
    expect(translit("Hugo", "es")).toBe("w-g-w");
    expect(translit("Valeria", "es")).toBe("b-ꜣ-r-j-r-j-ꜣ");
    expect(translit("Cecilia", "es")).toBe("s-j-s-j-r-j-ꜣ");
    expect(translit("Zoe", "es")).toBe("s-w-j");
    expect(translit("Joaquín", "es")).toBe("ḫ-w-ꜣ-k-j-n");
    expect(translit("Chema", "es")).toBe("š-j-m-ꜣ");
  });
  it("gives sign names and notes in Spanish", () => {
    const r = transliterateName("José", "es");
    expect(r[0].mapping.signName).toBe("Placenta");
    expect(r[1].mapping.signName).toBe("Polluelo de codorniz");
    expect(r[0].mapping.note).toMatch(/española/);
    expect(r[2].mapping.note).toMatch(/tela doblada/);
  });
});

describe("French spelling (locale fr)", () => {
  it("drops silent endings but keeps é and a said -s: Jacques, Margaux, Chloé, Inès", () => {
    expect(inputs("Jacques", "fr")).toEqual(["j", "a", "cqu"]);
    expect(translit("Margaux", "fr")).toBe("m-ꜣ-r-g-w");
    expect(translit("Chloé", "fr")).toBe("k-r-w-j");
    expect(translit("Inès", "fr")).toBe("j-n-j-s");
  });
  it("reads ill after a vowel as y and au as o: Guillaume", () => {
    expect(inputs("Guillaume", "fr")).toEqual(["gu", "ill", "au", "m"]);
    expect(translit("Guillaume", "fr")).toBe("g-j-w-m");
  });
  it("keeps the l of -ill- after a consonant: Camille", () => {
    expect(translit("Camille", "fr")).toBe("k-ꜣ-m-j-r");
  });
  it("writes oi as w + a, ç as s, ph as f: François, Joséphine", () => {
    expect(translit("François", "fr")).toBe("f-r-ꜣ-n-s-wꜣ");
    expect(translit("Joséphine", "fr")).toBe("ḏ-w-s-j-f-j-n");
  });
  it("writes ch as sh, gn as n + y, eau as o: Charlotte, Agnès, Rousseau", () => {
    expect(translit("Charlotte", "fr")).toBe("š-ꜣ-r-r-w-t");
    expect(translit("Agnès", "fr")).toBe("ꜣ-nj-j-s");
    expect(translit("Rousseau", "fr")).toBe("r-w-s-w");
  });
  it("gives sign names and notes in French", () => {
    const r = transliterateName("Margaux", "fr");
    expect(r[0].mapping.signName).toBe("Chouette");
    expect(r[4].mapping.note).toMatch(/« Au »/);
    expect(transliterateName("François", "fr")[5].mapping.signName).toBe("Poussin de caille + Vautour");
    expect(transliterateName("Begoña", "es")[4].mapping.signName).toBe("Onda de agua + Junco");
    expect(transliterateName("Xavi", "es")[0].mapping.signName).toBe("Cesta con asa + Tela doblada");
  });
  it("only ever uses signs from the translator's table", () => {
    const known = new Set(getAlphabetMappings().flatMap((m) => Array.from(m.glyph)));
    for (const name of ["José", "Begoña", "Guillermo", "François", "Agnès", "Jacques", "Chloé", "Guillaume", "Joséphine"]) {
      for (const locale of ["es", "fr"] as const) {
        for (const r of transliterateName(name, locale)) for (const g of Array.from(r.mapping.glyph)) expect(known.has(g), `${name}/${locale}`).toBe(true);
      }
    }
  });
});

describe("doubled letters", () => {
  it("finds the consonants written once, and nothing else", async () => {
    const { doubledLetters, getTransliteration } = await import("@/lib/hieroglyph-translator");
    expect(doubledLetters("Anna")).toEqual(["n"]);
    expect(doubledLetters("Harry")).toEqual(["r"]);
    expect(doubledLetters("Annabelle")).toEqual(["n", "l"]);
    expect(doubledLetters("Aaron")).toEqual([]);
    expect(doubledLetters("Tom")).toEqual([]);
    // and they really are written once
    expect(getTransliteration("Anna")).toBe("ꜣ-n-ꜣ");
  });
});
