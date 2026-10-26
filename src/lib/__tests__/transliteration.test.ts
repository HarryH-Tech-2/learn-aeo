import { describe, expect, it } from "vitest";
import { checkTransliteration, typedAnswer } from "../transliteration";

describe("typedAnswer", () => {
  it("drops the reading label", () => {
    expect(typedAnswer("ꜣ (aleph)")).toBe("ꜣ");
    expect(typedAnswer("št (100)")).toBe("št");
    expect(typedAnswer("ꞽꜥrt (uraeus)")).toBe("ꞽꜥrt");
  });
  it("has nothing to type for determinatives", () => {
    expect(typedAnswer("(det.)")).toBeNull();
    expect(typedAnswer("(plural)")).toBeNull();
  });
});

describe("checkTransliteration", () => {
  it("takes the Egyptological spelling without its label", () => {
    expect(checkTransliteration("ꜥ", "ꜥ (ayin)")).toBe("exact");
    expect(checkTransliteration("ꜥ (ayin)", "ꜥ (ayin)")).toBe("exact");
    expect(checkTransliteration(" B ", "b")).toBe("exact");
  });
  it("takes keyboard spellings as close", () => {
    expect(checkTransliteration("3", "ꜣ (aleph)")).toBe("close");
    expect(checkTransliteration("a", "ꜥ (ayin)")).toBe("close");
    expect(checkTransliteration("i", "ꞽ (yod)")).toBe("close");
    expect(checkTransliteration("kh", "ḫ")).toBe("close");
    expect(checkTransliteration("sh", "š")).toBe("close");
    expect(checkTransliteration("dj", "ḏ")).toBe("close");
    expect(checkTransliteration("wdj3t", "wḏꜣt")).toBe("close");
    expect(checkTransliteration("ra", "rꜥ")).toBe("close");
    expect(checkTransliteration("khpr", "ḫpr")).toBe("close");
    expect(checkTransliteration("sht", "št (100)")).toBe("close");
  });
  it("still tells different sounds apart", () => {
    expect(checkTransliteration("h", "ḫ")).toBe("wrong");
    expect(checkTransliteration("s", "š")).toBe("wrong");
    expect(checkTransliteration("t", "ṯ")).toBe("wrong");
    expect(checkTransliteration("m", "n")).toBe("wrong");
    expect(checkTransliteration("", "b")).toBe("wrong");
  });
});
