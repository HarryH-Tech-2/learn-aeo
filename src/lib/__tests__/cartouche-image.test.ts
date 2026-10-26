import { describe, it, expect } from "vitest";
import { fitGlyphFontSize, cartoucheFilename } from "@/lib/cartouche-image";
import { isValidEmail, normaliseEmail } from "@/lib/leads";

describe("fitGlyphFontSize", () => {
  it("uses the cap for short names", () => {
    expect(fitGlyphFontSize(3, 800)).toBe(150);
  });
  it("shrinks for long names so they fit the cartouche", () => {
    const size = fitGlyphFontSize(12, 800);
    expect(size).toBeLessThan(150);
    expect(size * 12 * 0.92).toBeLessThanOrEqual(800);
  });
  it("never goes below the readable floor", () => {
    expect(fitGlyphFontSize(40, 400)).toBe(40);
  });
});

describe("cartoucheFilename", () => {
  it("slugifies the name", () => {
    expect(cartoucheFilename("Harry")).toBe("harry-cartouche.png");
    expect(cartoucheFilename("Mary-Jane O'Neil")).toBe("mary-jane-o-neil-cartouche.png");
  });
  it("falls back when the name has no usable characters", () => {
    expect(cartoucheFilename("!!!")).toBe("my-cartouche.png");
  });
});

describe("email validation", () => {
  it("accepts ordinary addresses and normalises case/whitespace", () => {
    expect(isValidEmail(" Harry@Example.com ")).toBe(true);
    expect(normaliseEmail(" Harry@Example.com ")).toBe("harry@example.com");
  });
  it("rejects junk", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail(42)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});
