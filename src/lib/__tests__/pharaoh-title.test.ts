import { describe, expect, it } from "vitest";
import { EPITHETS, pharaohTitle, pharaohTitleText } from "@/lib/pharaoh-title";

describe("pharaoh title", () => {
  it("is the same for the same name, whatever the case or spacing", () => {
    expect(pharaohTitle("Cleopatra")).toEqual(pharaohTitle("  cleopatra "));
    expect(pharaohTitle("Mary  Anne")).toEqual(pharaohTitle("mary anne"));
  });

  it("always gives two different epithets", () => {
    for (const n of ["a", "harry", "cleopatra", "zoë", "mary anne", "x".repeat(30), "Ζωή"]) {
      const [a, b] = pharaohTitle(n);
      expect(a).not.toBe(b);
    }
  });

  it("uses every epithet across names", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) pharaohTitle(`name${i}`).forEach((e) => seen.add(e.en));
    expect(seen.size).toBe(EPITHETS.length);
  });

  it("writes only Egyptian hieroglyphs in the glyph groups", () => {
    for (const e of EPITHETS) for (const c of e.glyphs) expect(c.codePointAt(0)).toBeGreaterThanOrEqual(0x13000);
  });

  it("reads as a title", () => {
    expect(pharaohTitleText("cleopatra")).toMatch(/^Cleopatra, [A-Z].+, [A-Z].+$/);
  });
});
