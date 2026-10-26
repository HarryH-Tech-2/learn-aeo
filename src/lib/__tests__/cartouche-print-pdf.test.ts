import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";
import { buildCartouchePrintPdf, familyWritingRules, paletteFor, writingRules } from "@/lib/cartouche-print-pdf";
import { CARTOUCHE_PRINT_THEMES } from "@/lib/cartouche-print";
import { getAlphabetMappings, transliterateName } from "@/lib/hieroglyph-translator";

// Set CARTOUCHE_PRINT_OUT to a directory to keep the PDFs for a look.
const OUT = process.env.CARTOUCHE_PRINT_OUT;

async function build(name: string, theme?: Parameters<typeof buildCartouchePrintPdf>[1]) {
  const bytes = await buildCartouchePrintPdf(name, theme);
  if (OUT) fs.writeFileSync(path.join(OUT, `${name}${theme ? `-${theme}` : ""}.pdf`), bytes);
  return bytes;
}

describe("buildCartouchePrintPdf", () => {
  it("the subset hieroglyph font holds every sign the translator can produce", () => {
    const font = fontkit.create(fs.readFileSync(path.join(process.cwd(), "src/app/cartouche-image/noto-egyptian-translator.ttf")));
    const missing = getAlphabetMappings().filter((m) => !font.hasGlyphForCodePoint(m.glyph.codePointAt(0)!));
    expect(missing.map((m) => `${m.input}:${m.gardiner}`)).toEqual([]);
  });

  it("builds a three-page A4 PDF for a short name", async () => {
    const bytes = await build("Harry");
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    const { width, height } = doc.getPage(0).getSize();
    expect(Math.round(width)).toBe(595);
    expect(Math.round(height)).toBe(842);
    expect(doc.getTitle()).toBe("The cartouche of Harry");
  });

  it("prints a poster from the upscaled scene, and every scene has one", async () => {
    const a4 = await buildCartouchePrintPdf("Anna", "halloween", { pages: "print" });
    const poster = await buildCartouchePrintPdf("Anna", "halloween", { pages: "print", large: true });
    expect((await PDFDocument.load(poster)).getPageCount()).toBe(1);
    // the large art is several times the A4 art, so the poster file is far bigger
    expect(poster.byteLength).toBeGreaterThan(a4.byteLength * 2);
    for (const t of CARTOUCHE_PRINT_THEMES.filter((x) => x.art)) {
      expect(fs.existsSync(path.join(process.cwd(), "public", t.art!.replace("/cartouche-print/", "/cartouche-print/large/")))).toBe(true);
    }
    // a plain paper has no large art and still builds
    expect((await buildCartouchePrintPdf("Anna", "cream", { pages: "print", large: true })).byteLength).toBeGreaterThan(1000);
  });

  it("a long name spills the key onto a fourth page", async () => {
    const name = "Christopher Alexander";
    expect(transliterateName(name).length).toBeGreaterThan(12);
    const doc = await PDFDocument.load(await build(name));
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(4);
  });

  it("copes with accented letters the display font cannot set", async () => {
    const doc = await PDFDocument.load(await build("Zoë"));
    expect(doc.getPageCount()).toBe(3);
  });

  it("sets the page in every paper's colours", async () => {
    for (const t of CARTOUCHE_PRINT_THEMES) {
      const bytes = await build("Cleo", t.id);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount()).toBe(3);
      expect(doc.getTitle()).toBe("The cartouche of Cleo");
    }
    const night = paletteFor("night");
    const cream = paletteFor("cream");
    expect(night.page).not.toEqual(cream.page);
    expect(night.ink.red).toBeGreaterThan(cream.ink.red);
    // seventeen papers, each a full three-page PDF
  }, 60_000);

  it("refuses a name with no signs", async () => {
    await expect(buildCartouchePrintPdf("   ")).rejects.toThrow(/no signs/);
  });

  it("a family print stacks two to four names on page one, gives each name its own key and one story", async () => {
    const names = ["Christopher Alexander", "Maximiliana Josephine", "Bartholomew Fitzgerald", "Anastasia Wilhelmina"];
    const bytes = await buildCartouchePrintPdf(names, "temple");
    if (OUT) fs.writeFileSync(path.join(OUT, "family-4-temple.pdf"), bytes);
    const doc = await PDFDocument.load(bytes);
    // page one, at least one key page per name, the story
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1 + names.length + 1);
    expect(doc.getTitle()).toBe("The cartouches of Christopher Alexander, Maximiliana Josephine, Bartholomew Fitzgerald and Anastasia Wilhelmina");
    const { width, height } = doc.getPage(0).getSize();
    expect([Math.round(width), Math.round(height)]).toEqual([595, 842]);

    const two = await PDFDocument.load(await buildCartouchePrintPdf(["Harry", "Sally"]));
    expect(two.getPageCount()).toBe(4);
    expect(two.getTitle()).toBe("The cartouches of Harry and Sally");

    // The posted print's artwork is page one alone, family or not.
    const art = await PDFDocument.load(await buildCartouchePrintPdf(names, "night", { pages: "print" }));
    expect(art.getPageCount()).toBe(1);
  });

  it("a list of one name builds the single-name PDF", async () => {
    const doc = await PDFDocument.load(await buildCartouchePrintPdf(["Harry"]));
    expect(doc.getPageCount()).toBe(3);
    expect(doc.getTitle()).toBe("The cartouche of Harry");
  });

  it("familyWritingRules merges the names' notes without repeats and one reading-direction line", () => {
    const rules = familyWritingRules([transliterateName("Harry"), transliterateName("Sally")]);
    expect(rules.filter((r) => /vulture/.test(r))).toHaveLength(1);
    expect(rules.filter((r) => /left to right/.test(r))).toHaveLength(1);
    expect(rules.filter((r) => /mouth sign/.test(r))).toHaveLength(1);
  });

  it("writingRules only mentions the rules a name actually used", () => {
    const bob = writingRules(transliterateName("Bob")).join(" ");
    expect(bob).toMatch(/quail chick/);
    expect(bob).not.toMatch(/vulture/);
    expect(bob).not.toMatch(/doubled letter/i);
    const harry = writingRules(transliterateName("Harry")).join(" ");
    expect(harry).toMatch(/vulture/);
    expect(harry).toMatch(/mouth sign/);
    expect(harry).toMatch(/reed leaf/);
  });
});
