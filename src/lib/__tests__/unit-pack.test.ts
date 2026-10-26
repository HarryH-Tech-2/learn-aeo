import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";
import {
  UNIT_PACK,
  isPaper,
  isUnitPackFrom,
  paperForCountry,
  unitPackAmount,
  unitPackCheckoutParams,
  unitPackDownloadPath,
  unitPackFilename,
  unitPackFromPath,
  unitPackPrice,
} from "@/lib/unit-pack/product";
import { ALPHABET_CHART, LESSONS, LESSON2_NAMES, QUIZ_A, QUIZ_MARKS, nameGlyphs, type Block } from "@/lib/unit-pack/content";
import { UNIT_GLYPH_FONT } from "@/lib/unit-pack/fonts";
import { buildUnitPackPdf, PAPER_SIZE } from "@/lib/unit-pack/pdf";
import { UNILITERAL_GROUPS } from "@/lib/content/uniliterals";
import { getHieroglyphs } from "@/lib/hieroglyph-translator";

// Set UNIT_PACK_OUT to a directory to keep the PDFs for a look.
const OUT = process.env.UNIT_PACK_OUT;

describe("unit pack product", () => {
  it("is $19 / £15, charged in minor units", () => {
    expect(unitPackAmount("USD")).toBe(19);
    expect(unitPackAmount("GBP")).toBe(15);
    expect(unitPackPrice("USD")).toBe("$19");
    expect(unitPackPrice("GBP")).toBe("£15");
  });

  it("builds the Checkout Session's line item and metadata", () => {
    const p = unitPackCheckoutParams({ currency: "GBP", paper: "a4", from: "worksheet", gaClientId: "1.2", gaSessionId: "3", base: "https://x.test" });
    expect(p.mode).toBe("payment");
    expect(p.line_items[0].price_data).toMatchObject({ currency: "gbp", unit_amount: 1500, product_data: { name: UNIT_PACK.name } });
    expect(p.metadata).toEqual({ product: "unit-pack", paper: "a4", from: "worksheet", ga_client_id: "1.2", ga_session_id: "3" });
    expect(p.success_url).toBe("https://x.test/teachers/unit-pack/thanks?session_id={CHECKOUT_SESSION_ID}");
    expect(p.cancel_url).toBe("https://x.test/teachers/worksheet?unit_pack=cancelled");
    const us = unitPackCheckoutParams({ currency: "USD", paper: "letter", from: "teachers", gaClientId: "", gaSessionId: "", base: "" });
    expect(us.line_items[0].price_data).toMatchObject({ currency: "usd", unit_amount: 1900 });
    // GA4 reads params named source / medium / campaign as traffic source: never in metadata either.
    expect(Object.keys(us.metadata)).not.toContain("source");
  });

  it("picks Letter for the US and Canada, A4 elsewhere", () => {
    expect(paperForCountry("US")).toBe("letter");
    expect(paperForCountry("ca")).toBe("letter");
    expect(paperForCountry("GB")).toBe("a4");
    expect(paperForCountry(null)).toBe("a4");
  });

  it("validates its inputs", () => {
    expect(isPaper("a4")).toBe(true);
    expect(isPaper("A3")).toBe(false);
    expect(isUnitPackFrom("worksheet")).toBe(true);
    expect(isUnitPackFrom("https://evil.test")).toBe(false);
    expect(unitPackFromPath("teachers")).toBe("/teachers");
    expect(unitPackFromPath("unit-pack")).toBe("/teachers/unit-pack");
    expect(unitPackFilename("letter")).toBe("ancient-egypt-writing-unit-us-letter.pdf");
    expect(unitPackFilename("a4", true)).toBe("ancient-egypt-writing-unit-free-sample-a4.pdf");
    expect(unitPackDownloadPath("cs_test_1", "a4")).toBe("/api/unit-pack/download?session_id=cs_test_1&paper=a4");
  });
});

/** Every string in the content, for the font and character checks. */
function strings(): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(LESSONS);
  walk(QUIZ_A);
  walk(ALPHABET_CHART);
  return out;
}

describe("unit pack content", () => {
  it("has five lessons of 45 to 50 minutes, each with a worksheet and answers", () => {
    expect(LESSONS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5]);
    for (const l of LESSONS) {
      const minutes = l.steps.reduce((s, x) => s + x.min, 0);
      expect(minutes).toBeGreaterThanOrEqual(45);
      expect(minutes).toBeLessThanOrEqual(50);
      expect(l.objectives.length).toBeGreaterThan(0);
      expect(l.england.length + l.us.length).toBeGreaterThan(1);
      expect(l.worksheet.length).toBeGreaterThan(2);
      expect(l.answers.length).toBeGreaterThan(0);
      expect(l.support.length + l.stretch.length).toBeGreaterThan(1);
    }
  });

  it("the chart is the course's 25 alphabet signs", () => {
    const course = UNILITERAL_GROUPS.flatMap((g) => g.glyphs.map((s) => s.symbol));
    expect(ALPHABET_CHART.map((s) => s.glyph).sort()).toEqual([...new Set(course)].sort());
    expect(ALPHABET_CHART).toHaveLength(25);
  });

  it("the Lesson 2 names are spelled as the translator spells them", () => {
    for (const n of LESSON2_NAMES) expect(nameGlyphs(n)).toBe(getHieroglyphs(n));
  });

  it("the quiz is out of 20 and every answer index is an option", () => {
    expect(QUIZ_MARKS).toBe(20);
    for (const q of QUIZ_A) expect(q.options[q.answer]).toBeTruthy();
  });

  it("the embedded hieroglyph font holds every sign the pack uses", () => {
    const font = fontkit.create(Buffer.from(UNIT_GLYPH_FONT, "base64"));
    const used = new Set<number>();
    for (const s of strings()) for (const ch of s) if (ch.codePointAt(0)! >= 0x13000 && ch.codePointAt(0)! <= 0x1345f) used.add(ch.codePointAt(0)!);
    for (const ch of getHieroglyphs("Scribe Sam")) used.add(ch.codePointAt(0)!);
    const missing = [...used].filter((cp) => !font.hasGlyphForCodePoint(cp)).map((cp) => cp.toString(16));
    expect(missing).toEqual([]);
    expect(used.size).toBeGreaterThan(40);
  });

  it("uses only characters the PDF's standard fonts can set (besides hieroglyphs)", () => {
    // WinAnsi: Latin-1 plus a few typographic marks. Egyptological letters (ꜣ ḥ ḫ š …) would silently vanish.
    const extra = new Set([..."‘’“”–—•…★"]);
    const bad = new Set<string>();
    for (const s of strings()) {
      for (const ch of s) {
        const cp = ch.codePointAt(0)!;
        if (cp >= 0x13000 && cp <= 0x1345f) continue;
        if (cp <= 0xff || extra.has(ch)) continue;
        bad.add(ch);
      }
    }
    expect([...bad]).toEqual([]);
  });

  it("block kinds are all ones the layout draws", () => {
    const kinds = new Set(["task", "h", "p", "bullets", "lines", "cartouche", "decode", "table", "tf", "mcq", "match", "rosetta", "chart", "box", "space", "break"]);
    const all: Block[] = LESSONS.flatMap((l) => [...l.worksheet, ...l.answers]);
    for (const b of all) expect(kinds.has(b.k)).toBe(true);
  });
});

describe("buildUnitPackPdf", () => {
  async function build(paper: "a4" | "letter", sample: boolean) {
    const bytes = await buildUnitPackPdf({ paper, sample });
    if (OUT) fs.writeFileSync(path.join(OUT, `unit-${sample ? "sample" : "full"}-${paper}.pdf`), bytes);
    return PDFDocument.load(bytes);
  }

  it("builds the full unit on A4 without crashing, with every lesson", async () => {
    const doc = await build("a4", false);
    const n = doc.getPageCount();
    expect(n).toBeGreaterThanOrEqual(18);
    expect(n).toBeLessThanOrEqual(36);
    const { width, height } = doc.getPage(0).getSize();
    expect(Math.round(width)).toBe(Math.round(PAPER_SIZE.a4.width));
    expect(Math.round(height)).toBe(Math.round(PAPER_SIZE.a4.height));
    expect(doc.getTitle()).toBe(UNIT_PACK.name);
  }, 30000);

  it("builds on US Letter too", async () => {
    const doc = await build("letter", false);
    const { width, height } = doc.getPage(3).getSize();
    expect([Math.round(width), Math.round(height)]).toEqual([612, 792]);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(18);
  }, 30000);

  it("the free sample is Lesson 1 only, and much shorter", async () => {
    const sample = await build("a4", true);
    const full = await PDFDocument.load(await buildUnitPackPdf({ paper: "a4" }));
    expect(sample.getPageCount()).toBeGreaterThanOrEqual(5);
    expect(sample.getPageCount()).toBeLessThan(full.getPageCount() / 2);
    expect(sample.getTitle()).toContain("free sample");
    if (OUT) await build("letter", true);
  }, 30000);
});

describe("unit pack emails", () => {
  it("the bought unit's email links both paper sizes and carries no hieroglyphs", async () => {
    const { renderUnitPackEmail, renderUnitPackSampleEmail } = await import("@/lib/unit-pack/email");
    const mail = renderUnitPackEmail({ paper: "letter", downloadUrl: "https://x.test/d?paper=letter", otherPaperUrl: "https://x.test/d?paper=a4" });
    expect(mail.subject).toContain(UNIT_PACK.name);
    expect(mail.html).toContain("https://x.test/d?paper=letter");
    expect(mail.html).toContain("https://x.test/d?paper=a4");
    expect(mail.html).toContain("Download (US Letter)");
    const sample = renderUnitPackSampleEmail({ paper: "a4", price: "£15" });
    expect(sample.text).toContain("£15");
    for (const t of [mail.html, mail.text, sample.html, sample.text]) expect(/[\u{13000}-\u{1345F}]/u.test(t)).toBe(false);
  });
});
