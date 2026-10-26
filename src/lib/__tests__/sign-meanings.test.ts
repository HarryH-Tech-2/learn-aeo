import { describe, expect, it } from "vitest";
import { ANKH_POST, SIGN_MEANINGS, codePointOf, getSignMeaning, signMeaningPath, unicodeNameFor } from "@/lib/sign-meanings";
import { blogPosts } from "@/lib/blog-posts";

/**
 * Unicode names checked with python's unicodedata (u.name(chr(cp))); the data module must agree with them,
 * so a wrong code point or Gardiner number can never ship.
 */
const UNICODE_NAMES: Record<number, string> = {
  0x13080: "EGYPTIAN HIEROGLYPH D010",
  0x131a3: "EGYPTIAN HIEROGLYPH L001",
  0x132bd: "EGYPTIAN HIEROGLYPH R011",
  0x132f9: "EGYPTIAN HIEROGLYPH S034",
};

describe("sign meanings data", () => {
  it("covers the Eye of Horus, scarab and djed, and not the ankh (that has its own blog post)", () => {
    expect(SIGN_MEANINGS.map((s) => s.glyph)).toEqual(["𓂀", "𓆣", "𓊽"]);
    expect(SIGN_MEANINGS.some((s) => s.glyph === "𓋹")).toBe(false);
  });

  it("has unique slugs that resolve", () => {
    const slugs = SIGN_MEANINGS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of SIGN_MEANINGS) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(getSignMeaning(s.slug)).toBe(s);
      expect(signMeaningPath(s.slug)).toBe(`/hieroglyph-meaning/${s.slug}`);
    }
  });

  it("each glyph is one character whose code point and Unicode name match its Gardiner number", () => {
    for (const s of [...SIGN_MEANINGS, ANKH_POST]) {
      expect([...s.glyph]).toHaveLength(1);
      expect(codePointOf(s.glyph)).toBe(s.codePoint);
      expect(UNICODE_NAMES[s.glyph.codePointAt(0)!]).toBe(unicodeNameFor(s.gardiner));
    }
  });

  it("maps Gardiner numbers to Unicode names", () => {
    expect(unicodeNameFor("D10")).toBe("EGYPTIAN HIEROGLYPH D010");
    expect(unicodeNameFor("L1")).toBe("EGYPTIAN HIEROGLYPH L001");
    expect(unicodeNameFor("R11")).toBe("EGYPTIAN HIEROGLYPH R011");
    expect(unicodeNameFor("A1A")).toBe("EGYPTIAN HIEROGLYPH A001A");
  });

  it("titles start with the glyph and the snippets are search-length", () => {
    for (const s of SIGN_MEANINGS) {
      expect(s.metaTitle.startsWith(s.glyph)).toBe(true);
      expect(s.metaTitle.length).toBeLessThanOrEqual(62);
      expect(s.metaDescription.length).toBeLessThanOrEqual(165);
      expect(s.metaDescription).toContain(s.glyph);
    }
  });

  it("has an FAQ that asks the pasted-glyph question, and a substantial body", () => {
    for (const s of SIGN_MEANINGS) {
      expect(s.faqs.length).toBeGreaterThanOrEqual(3);
      expect(s.faqs[0].q).toBe(`What does ${s.glyph} mean?`);
      const words = [s.quickAnswer, ...s.sections.flatMap((x) => x.paragraphs)].join(" ").split(/\s+/).length;
      expect(words).toBeGreaterThan(450);
      expect(words).toBeLessThan(900);
    }
  });

  it("links only to pages that exist", () => {
    const posts = new Set(blogPosts.map((p) => `/blog/${p.slug}`));
    expect(posts.has(ANKH_POST.href)).toBe(true);
    for (const s of SIGN_MEANINGS) {
      const text = s.sections.flatMap((x) => x.paragraphs).join(" ");
      for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
        if (href.startsWith("/blog/")) expect(posts.has(href)).toBe(true);
      }
    }
  });
});
