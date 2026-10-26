import { describe, expect, it } from "vitest";
import { cuneiformName, nameToSounds } from "@/lib/cuneiform";

const tr = (n: string) => cuneiformName(n).transliteration;

describe("nameToSounds", () => {
  it("folds English spelling into Akkadian sounds", () => {
    expect(nameToSounds("Sophie").join("")).toBe("supi"); // ph → p, o → u, ie → i
    expect(nameToSounds("Grace").join("")).toBe("gras"); // soft c, silent e
    expect(nameToSounds("Chloe").join("")).toBe("klue"); // ch before l is k
    expect(nameToSounds("Sarah").join("")).toBe("sara"); // silent final h
    expect(nameToSounds("Harry").join("")).toBe("ḫari"); // h is ḫ, rr is one r, final y is i
  });
});

describe("cuneiformName", () => {
  it("writes names syllable by syllable", () => {
    expect(tr("Harry")).toBe("ḫa-ri");
    expect(tr("Anna")).toBe("a-na");
    expect(tr("Kate")).toBe("ka-at");
    expect(tr("Jack")).toBe("ia-ak");
    expect(tr("John")).toBe("i-u-un");
    expect(tr("Gilgamesh")).toBe("gi-il-ga-me-eš");
    expect(tr("Hammurabi")).toBe("ḫa-mu-ra-bi");
  });

  it("uses the right sign for each syllable", () => {
    expect(cuneiformName("Harry").text).toBe("𒄩𒊑"); // ḪA RI
    expect(cuneiformName("Gilgamesh").text).toBe("𒄀𒅋𒂵𒈨𒅖"); // GI IL GA ME IŠ
  });

  it("puts the name marker first", () => {
    const m = cuneiformName("Harry", "man");
    expect(m.transliteration).toBe("ᵐḫa-ri");
    expect(m.text).toBe("𒁹𒄩𒊑");
    const f = cuneiformName("Anna", "woman");
    expect(f.transliteration).toBe("ᶠa-na");
    expect(f.text.startsWith("𒊩")).toBe(true);
    expect(cuneiformName("", "man").text).toBe("");
  });

  it("only ever writes signs from the cuneiform block", () => {
    for (const n of ["Elizabeth", "Mohammed", "Xavier", "Quentin", "Wendy", "Yvonne", "Zoë", "Siobhan"]) {
      for (const c of cuneiformName(n, "woman").text) {
        const cp = c.codePointAt(0)!;
        expect(cp >= 0x12000 && cp <= 0x123ff).toBe(true);
      }
      expect(cuneiformName(n).syllables.length).toBeGreaterThan(0);
    }
  });
});
