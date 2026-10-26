import { describe, it, expect } from "vitest";
import {
  NUMERAL_SIGNS,
  toHieroglyphic,
  fromHieroglyphic,
  decompose,
  sameNumber,
  wellFormed,
  randomNumber,
  unitFraction,
} from "@/lib/numerals";

describe("numeral signs", () => {
  it("are single hieroglyph code points for 1 … 1,000,000", () => {
    expect(NUMERAL_SIGNS.map((s) => s.value)).toEqual([1, 10, 100, 1000, 10000, 100000, 1000000]);
    for (const s of NUMERAL_SIGNS) {
      expect(Array.from(s.glyph)).toHaveLength(1);
      expect(s.glyph.codePointAt(0)!).toBeGreaterThanOrEqual(0x13000);
    }
  });
});

describe("toHieroglyphic", () => {
  it("writes units, tens, hundreds largest first", () => {
    expect(toHieroglyphic(1)).toBe("𓏤");
    expect(toHieroglyphic(4)).toBe("𓏤𓏤𓏤𓏤");
    expect(toHieroglyphic(10)).toBe("𓎆");
    expect(toHieroglyphic(12)).toBe("𓎆𓏤𓏤");
    expect(toHieroglyphic(123)).toBe("𓍢𓎆𓎆𓏤𓏤𓏤");
    expect(toHieroglyphic(1000)).toBe("𓆼");
    expect(toHieroglyphic(2_345)).toBe("𓆼𓆼𓍢𓍢𓍢𓎆𓎆𓎆𓎆𓏤𓏤𓏤𓏤𓏤");
    expect(toHieroglyphic(1_000_000)).toBe("𓁨");
  });
  it("rejects 0, negatives and non-integers", () => {
    expect(() => toHieroglyphic(0)).toThrow();
    expect(() => toHieroglyphic(-3)).toThrow();
    expect(() => toHieroglyphic(1.5)).toThrow();
  });
});

describe("fromHieroglyphic", () => {
  it("round-trips and ignores sign order", () => {
    for (const n of [1, 9, 10, 99, 100, 101, 999, 1234, 90_000, 123_456]) {
      expect(fromHieroglyphic(toHieroglyphic(n))).toBe(n);
    }
    expect(fromHieroglyphic("𓏤𓏤𓎆")).toBe(12);
  });
  it("returns null for foreign signs or empty input", () => {
    expect(fromHieroglyphic("𓏤𓅓")).toBeNull();
    expect(fromHieroglyphic("")).toBeNull();
  });
});

describe("decompose / sameNumber / wellFormed", () => {
  it("decomposes into grouped parts", () => {
    expect(decompose(232).map((p) => [p.sign.value, p.count])).toEqual([
      [100, 2],
      [10, 3],
      [1, 2],
    ]);
  });
  it("sameNumber compares by value", () => {
    expect(sameNumber(["𓎆", "𓏤", "𓏤"], 12)).toBe(true);
    expect(sameNumber(["𓏤", "𓎆", "𓏤"], 12)).toBe(true);
    expect(sameNumber(["𓎆", "𓏤"], 12)).toBe(false);
  });
  it("wellFormed caps each sign at nine", () => {
    expect(wellFormed(Array(9).fill("𓏤"))).toBe(true);
    expect(wellFormed(Array(10).fill("𓏤"))).toBe(false);
  });
});

describe("randomNumber", () => {
  it("stays in range and within the sign budget", () => {
    let s = 42;
    const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000);
    for (let i = 0; i < 50; i++) {
      const n = randomNumber(100, 999, rng, 8);
      expect(n).toBeGreaterThanOrEqual(100);
      expect(n).toBeLessThanOrEqual(999);
      expect(decompose(n).reduce((t, p) => t + p.count, 0)).toBeLessThanOrEqual(8);
    }
  });
});

describe("unitFraction", () => {
  it("is the mouth sign over the number", () => {
    expect(unitFraction(3)).toBe("𓂋𓏤𓏤𓏤");
    expect(unitFraction(10)).toBe("𓂋𓎆");
    expect(() => unitFraction(1)).toThrow();
  });
});
