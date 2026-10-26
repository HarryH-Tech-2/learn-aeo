/**
 * Builds the Cartouche Print PDF (server only): three A4 pages.
 *
 *   1. The print: the name in a cartouche on the paper the buyer chose (CARTOUCHE_PRINT_THEMES).
 *   2. Sign by sign: every sign in the name, what it depicts and why it was chosen.
 *   3. The story of the cartouche, and how this particular name was written.
 *
 * Vector throughout, with the hieroglyph and display fonts embedded, so it is
 * crisp at any size. Fonts are the same OFL subsets the social image uses
 * (src/app/cartouche-image/*.ttf); next.config lists them for file tracing so
 * the serverless functions ship them.
 */
import fs from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import type { Font as FontkitFont } from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb, type RGB } from "pdf-lib";
import { transliterateName, type TransliterationResult } from "@/lib/hieroglyph-translator";
import {
  FAMILY_BAND,
  cartouchePrintThemeById,
  DEFAULT_CARTOUCHE_PRINT_THEME,
  familyNameSize,
  familyPageLayout,
  joinCartoucheNames,
  type CartouchePrintThemeId,
} from "@/lib/cartouche-print";

// A4 in PostScript points.
export const A4 = { width: 595.28, height: 841.89 } as const;
const MARGIN = 54;

/** The theme's colours as pdf-lib RGB, threaded through every draw call. */
type Palette = { page: RGB; gold: RGB; goldDeep: RGB; ink: RGB; muted: RGB; rule: RGB; footerInset: number; art: string | null };

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export function paletteFor(theme: CartouchePrintThemeId): Palette {
  const t = cartouchePrintThemeById(theme);
  return {
    page: hexToRgb(t.page),
    gold: hexToRgb(t.gold),
    goldDeep: hexToRgb(t.goldDeep),
    ink: hexToRgb(t.ink),
    muted: hexToRgb(t.muted),
    rule: hexToRgb(t.rule),
    footerInset: t.footerInset,
    art: t.art ?? null,
  };
}

// The page-one artwork lives in public/ so the on-page preview can show the
// same file; next.config lists it for file tracing alongside the fonts.
const ART_DIR = path.join(process.cwd(), "public");
const artBytes = new Map<string, Promise<Uint8Array>>();
function loadArtBytes(publicPath: string): Promise<Uint8Array> {
  let p = artBytes.get(publicPath);
  if (!p) {
    p = fs.readFile(path.join(ART_DIR, ...publicPath.split("/").filter(Boolean))).then((b) => new Uint8Array(b));
    artBytes.set(publicPath, p);
  }
  return p;
}

/** The page-one scene; for a poster, its upscaled copy in large/ when there is one (the plain papers have none). */
async function loadArt(publicPath: string, large?: boolean): Promise<Uint8Array> {
  if (large) {
    try {
      return await loadArtBytes(publicPath.replace("/cartouche-print/", "/cartouche-print/large/"));
    } catch {
      artBytes.delete(publicPath.replace("/cartouche-print/", "/cartouche-print/large/"));
    }
  }
  return loadArtBytes(publicPath);
}

const FONT_DIR = path.join(process.cwd(), "src", "app", "cartouche-image");
const SITE = "learnhieroglyphics.com";

type Fonts = {
  glyph: PDFFont;
  glyphMetrics: FontkitFont;
  display: PDFFont;
  displayMetrics: FontkitFont;
  body: PDFFont;
  bodyBold: PDFFont;
  bodyItalic: PDFFont;
};

let fontBytes: Promise<{ glyph: Uint8Array; display: Uint8Array }> | null = null;
function loadFontBytes() {
  fontBytes ??= Promise.all([
    fs.readFile(path.join(FONT_DIR, "noto-egyptian-translator.ttf")),
    fs.readFile(path.join(FONT_DIR, "cinzel-600.ttf")),
  ]).then(([glyph, display]) => ({ glyph: new Uint8Array(glyph), display: new Uint8Array(display) }));
  return fontBytes;
}

/**
 * pdf-lib registers a fresh font resource on every drawText that names a
 * font (twice, in fact: set and restore). Hundreds of entries pointing at the
 * same font made pdf.js hang on the sign page, so set the page font once per
 * change and draw without naming it.
 */
const pageFont = new WeakMap<PDFPage, PDFFont>();
function txt(page: PDFPage, text: string, o: { x: number; y: number; size: number; font: PDFFont; color: RGB }) {
  if (pageFont.get(page) !== o.font) {
    page.setFont(o.font);
    pageFont.set(page, o.font);
  }
  page.drawText(text, { x: o.x, y: o.y, size: o.size, color: o.color });
}

/** Can this font set every character of `text`? Embedded fonts are asked via fontkit; the standard fonts are WinAnsi and throw. */
function canEncode(font: PDFFont, text: string, metrics?: FontkitFont): boolean {
  if (metrics) {
    for (const ch of text) if (!metrics.hasGlyphForCodePoint(ch.codePointAt(0)!)) return false;
    return true;
  }
  try {
    font.encodeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * The standard (WinAnsi) fonts cannot set Egyptological letters, and the
 * translator's notes use a few. Spell them out the way a textbook does in
 * plain type, then drop anything else the font still cannot encode.
 */
const PLAIN: Record<string, string> = { "ꜣ": "3", "ꜥ": "'", "ḫ": "kh", "ẖ": "kh", "ḏ": "dj", "ṯ": "tj", "ḥ": "h", "š": "sh", "ḳ": "q", "ẕ": "z", "ꞽ": "i", "ʾ": "'" };
function plainText(font: PDFFont, text: string): string {
  let out = text.replace(/[ꜣꜥḫẖḏṯḥšḳẕꞽʾ]/g, (c) => PLAIN[c] ?? "");
  // "the Egyptian 'aleph' (3)" reads better without the code.
  out = out.replace(/'aleph' \(3\)/g, "'aleph'");
  return [...out].filter((ch) => canEncode(font, ch)).join("");
}

/** Break `text` into lines no wider than `maxWidth`. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCentered(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: RGB, spacing = 0) {
  const width = font.widthOfTextAtSize(text, size) + spacing * Math.max(0, [...text].length - 1);
  let x = (A4.width - width) / 2;
  if (spacing === 0) {
    txt(page, text, { x, y, size, font, color });
    return;
  }
  // pdf-lib has no letter-spacing option; draw glyph by glyph.
  for (const ch of text) {
    txt(page, ch, { x, y, size, font, color });
    x += font.widthOfTextAtSize(ch, size) + spacing;
  }
}

function drawParagraph(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  leading: number,
  maxWidth: number,
  color: RGB
): number {
  for (const line of wrap(text, font, size, maxWidth)) {
    txt(page, line, { x, y, size, font, color });
    y -= leading;
  }
  return y;
}

/** The page colour and thin double frame every page carries. */
function drawFrame(page: PDFPage, pal: Palette) {
  page.drawRectangle({ x: 0, y: 0, width: A4.width, height: A4.height, color: pal.page });
  page.drawRectangle({ x: 26, y: 26, width: A4.width - 52, height: A4.height - 52, borderColor: pal.gold, borderWidth: 1.2 });
  page.drawRectangle({ x: 32, y: 32, width: A4.width - 64, height: A4.height - 64, borderColor: pal.rule, borderWidth: 0.5 });
}

function drawFooter(page: PDFPage, fonts: Fonts, pal: Palette, right?: string, y = 40) {
  drawCentered(page, SITE.toUpperCase(), y, fonts.display, 8, pal.goldDeep, 2.2);
  if (right) {
    const w = fonts.bodyItalic.widthOfTextAtSize(right, 8.5);
    txt(page, right, { x: A4.width - MARGIN - w, y, size: 8.5, font: fonts.bodyItalic, color: pal.muted });
  }
}

/**
 * A cartouche: a stadium (the rope loop) with the knot bar standing off the
 * right end. `x, y` is the bottom-left of the loop; `h` its height.
 */
function drawCartouche(page: PDFPage, pal: Palette, x: number, y: number, w: number, h: number, stroke: number) {
  const r = h / 2;
  // pdf-lib's SVG paths grow downwards from (x, y), so hand it the top-left corner.
  const loop = (width: number, height: number) => {
    const rr = height / 2;
    return `M ${rr} 0 H ${width - rr} A ${rr} ${rr} 0 0 1 ${width - rr} ${height} H ${rr} A ${rr} ${rr} 0 0 1 ${rr} 0 Z`;
  };
  page.drawSvgPath(loop(w, h), { x, y: y + h, borderColor: pal.gold, borderWidth: stroke });
  // An inner hairline gives the rope some body.
  const inset = stroke * 1.6;
  page.drawSvgPath(loop(w - 2 * inset, h - 2 * inset), { x: x + inset, y: y + h - inset, borderColor: pal.gold, borderWidth: 0.6 });
  // The knot.
  const barW = stroke * 3.2;
  const barH = h * 0.42;
  page.drawRectangle({
    x: x + w + stroke * 1.8,
    y: y + (h - barH) / 2,
    width: barW,
    height: barH,
    borderColor: pal.gold,
    borderWidth: stroke * 0.8,
  });
  void r;
}

/** Ink bounds of a run of hieroglyphs at `size`, in points. */
function glyphBounds(metrics: FontkitFont, text: string, size: number) {
  const run = metrics.layout(text);
  const scale = size / metrics.unitsPerEm;
  const bbox = run.bbox;
  return {
    width: run.advanceWidth * scale,
    minY: bbox.minY * scale,
    maxY: bbox.maxY * scale,
    minX: bbox.minX * scale,
  };
}

function pageOne(doc: PDFDocument, fonts: Fonts, pal: Palette, art: PDFImage | null, name: string, results: TransliterationResult[]) {
  const page = doc.addPage([A4.width, A4.height]);
  if (art) {
    // The artwork is stretched to A4 (the source is 2:3, a 6 % change no eye
    // can see on a texture) and carries its own border, so no drawn frame.
    page.drawRectangle({ x: 0, y: 0, width: A4.width, height: A4.height, color: pal.page });
    page.drawImage(art, { x: 0, y: 0, width: A4.width, height: A4.height });
  } else {
    drawFrame(page, pal);
  }

  const glyphs = results.map((r) => r.mapping.glyph).join("");
  const maxLoopW = A4.width - 2 * MARGIN - 40; // room for the knot
  // Size the signs to the loop: up to 110 pt, smaller for long names.
  let size = 110;
  let bounds = glyphBounds(fonts.glyphMetrics, glyphs, size);
  const padX = (s: number) => s * 0.55;
  while (bounds.width + 2 * padX(size) > maxLoopW && size > 24) {
    size -= 2;
    bounds = glyphBounds(fonts.glyphMetrics, glyphs, size);
  }
  const loopH = Math.max(size * 1.55, 120);
  const loopW = Math.max(Math.min(bounds.width + 2 * padX(size), maxLoopW), loopH * 1.6);
  const loopX = (A4.width - loopW - 30) / 2; // a touch left so loop plus knot sit centred
  const loopY = A4.height * 0.5 - loopH / 2 + 40;
  drawCartouche(page, pal, loopX, loopY, loopW, loopH, Math.max(3, size / 22));

  // Centre the ink of the glyph run inside the loop.
  const inkMid = (bounds.minY + bounds.maxY) / 2;
  const baseline = loopY + loopH / 2 - inkMid;
  const textX = loopX + (loopW - bounds.width) / 2 - bounds.minX;
  txt(page, glyphs, { x: textX, y: baseline, size, font: fonts.glyph, color: pal.ink });

  // Kicker above.
  drawCentered(page, "THE CARTOUCHE OF", loopY + loopH + 64, fonts.display, 11, pal.goldDeep, 4);
  page.drawLine({
    start: { x: A4.width / 2 - 36, y: loopY + loopH + 52 },
    end: { x: A4.width / 2 + 36, y: loopY + loopH + 52 },
    thickness: 0.6,
    color: pal.gold,
  });

  // The name, in Cinzel if it can set every letter, else Times.
  const upper = name.toUpperCase();
  const nameFont = canEncode(fonts.display, upper, fonts.displayMetrics) ? fonts.display : fonts.bodyBold;
  let nameSize = 36;
  while (nameFont.widthOfTextAtSize(upper, nameSize) + 3 * upper.length > A4.width - 2 * MARGIN && nameSize > 16) nameSize -= 2;
  drawCentered(page, upper, loopY - 74, nameFont, nameSize, pal.goldDeep, 3);
  drawCentered(page, "written in ancient Egyptian hieroglyphs", loopY - 100, fonts.bodyItalic, 12.5, pal.muted);

  const signs = results.length;
  drawCentered(page, `${signs} sign${signs === 1 ? "" : "s"}, read from left to right`, loopY - 118, fonts.body, 9.5, pal.muted);

  drawFooter(page, fonts, pal, undefined, pal.footerInset);
}

function pageSigns(doc: PDFDocument, fonts: Fonts, pal: Palette, name: string, results: TransliterationResult[]): number {
  let page = doc.addPage([A4.width, A4.height]);
  drawFrame(page, pal);
  let pages = 1;

  const top = A4.height - MARGIN - 30;
  drawCentered(page, "SIGN BY SIGN", top, fonts.display, 16, pal.goldDeep, 5);
  const sub = `Each sign in the cartouche of ${name} stands for a sound. Egyptian wrote consonants and left the vowels to the reader, so a modern name is transcribed sound by sound with the signs a scribe would have chosen.`;
  let y = drawParagraph(page, sub, MARGIN, top - 28, fonts.body, 10.5, 14.5, A4.width - 2 * MARGIN, pal.muted) - 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: A4.width - MARGIN, y }, thickness: 0.6, color: pal.gold });
  y -= 22;

  // Short names get roomier rows so the page is not two-thirds empty.
  const roomy = results.length <= 6;
  const glyphSize = roomy ? 44 : 30;
  const noteSize = roomy ? 11 : 9.5;
  const noteLead = roomy ? 15 : 12.5;
  const colGlyph = MARGIN + 8;
  const colLetter = MARGIN + (roomy ? 84 : 70);
  const colText = MARGIN + (roomy ? 136 : 118);
  const textW = A4.width - MARGIN - colText;

  results.forEach((r, i) => {
    const noteLines = wrap(r.mapping.note, fonts.body, noteSize, textW);
    const rowH = Math.max(roomy ? 78 : 50, (roomy ? 40 : 30) + noteLines.length * noteLead);
    if (y - rowH < 70) {
      drawFooter(page, fonts, pal, `The cartouche of ${name}`);
      page = doc.addPage([A4.width, A4.height]);
      drawFrame(page, pal);
      pages += 1;
      y = A4.height - MARGIN - 20;
    }

    // The sign, centred on the row's first line.
    const b = glyphBounds(fonts.glyphMetrics, r.mapping.glyph, glyphSize);
    const rowMid = y - (roomy ? 18 : 12);
    txt(page, r.mapping.glyph, {
      x: colGlyph + ((roomy ? 60 : 44) - b.width) / 2 - b.minX,
      y: rowMid - (b.minY + b.maxY) / 2,
      size: glyphSize,
      font: fonts.glyph,
      color: pal.ink,
    });

    // The letter it writes.
    const letter = r.input.toUpperCase();
    page.drawRectangle({ x: colLetter, y: rowMid - 13, width: 30, height: 26, borderColor: pal.gold, borderWidth: 0.8 });
    const lf = canEncode(fonts.display, letter, fonts.displayMetrics) ? fonts.display : fonts.bodyBold;
    const lsize = letter.length > 1 ? 10 : 13;
    txt(page, letter, {
      x: colLetter + (30 - lf.widthOfTextAtSize(letter, lsize)) / 2,
      y: rowMid - lsize * 0.36,
      size: lsize,
      font: lf,
      color: pal.goldDeep,
    });

    // Sign name, Gardiner number, then the note.
    const titleSize = roomy ? 13 : 11.5;
    txt(page, r.mapping.signName, { x: colText, y: y - 4, size: titleSize, font: fonts.bodyBold, color: pal.ink });
    const nameW = fonts.bodyBold.widthOfTextAtSize(r.mapping.signName, titleSize);
    txt(page, `Gardiner ${r.mapping.gardiner}`, { x: colText + nameW + 8, y: y - 4, size: 9, font: fonts.body, color: pal.muted });
    let ny = y - (roomy ? 24 : 20);
    for (const line of noteLines) {
      txt(page, line, { x: colText, y: ny, size: noteSize, font: fonts.body, color: pal.ink });
      ny -= noteLead;
    }

    y -= rowH;
    if (i < results.length - 1) {
      page.drawLine({ start: { x: MARGIN, y: y + 8 }, end: { x: A4.width - MARGIN, y: y + 8 }, thickness: 0.4, color: pal.rule });
    }
  });

  drawFooter(page, fonts, pal, `The cartouche of ${name}`);
  return pages;
}

/** For a family print: every name (WinAnsi-safe) and its signs, so the story speaks of all of them. */
type Family = { names: string[]; results: TransliterationResult[][] };

function pageStory(doc: PDFDocument, fonts: Fonts, pal: Palette, name: string, results: TransliterationResult[], family?: Family) {
  const page = doc.addPage([A4.width, A4.height]);
  drawFrame(page, pal);
  const top = A4.height - MARGIN - 30;
  drawCentered(page, "THE CARTOUCHE", top, fonts.display, 16, pal.goldDeep, 5);

  const w = A4.width - 2 * MARGIN;
  const size = 11;
  const leading = 15.5;
  let y = top - 34;
  const paras = [
    "The oval that surrounds a royal name is one of the most recognisable shapes in Egyptian art. The Egyptians called it shenu, from a verb meaning to encircle: a loop of rope, knotted at one end and stretched to fit the name inside it. The loop stood for everything the sun travels around, so a name written inside one was a claim to rule all of it.",
    "Kings began to write their names this way around 2600 BC, in the Fourth Dynasty, and kept doing so for nearly three thousand years. Of a pharaoh's five names, two were placed in cartouches: the throne name taken at accession and the birth name given as a child. The Egyptians believed a name was part of the person. To carve it in stone was to make its owner last; to chisel it out was to harm them.",
    "The modern word comes from Napoleon's soldiers in Egypt in 1798, who thought the shape looked like a cartouche, the paper cartridge for a musket. The name stuck, and it was these ovals that unlocked the script. In 1822 Jean-François Champollion started from the cartouches of Ptolemy and Cleopatra, whose names were known from Greek, matched sign to sound, and the rest of the language followed.",
  ];
  for (const p of paras) {
    y = drawParagraph(page, p, MARGIN, y, fonts.body, size, leading, w, pal.ink) - 9;
  }

  // How this name was written.
  y -= 6;
  const boxTop = y + 4;
  const rules = family ? familyWritingRules(family.results) : writingRules(results);
  const boxLines: string[][] = rules.map((r) => wrap(r, fonts.body, 10, w - 44));
  const boxH = 44 + boxLines.reduce((n, l) => n + l.length * 13.5 + 5, 0);
  page.drawRectangle({ x: MARGIN, y: boxTop - boxH, width: w, height: boxH, borderColor: pal.gold, borderWidth: 0.8 });
  const heading = family ? "HOW THESE NAMES WERE WRITTEN" : `HOW ${name.toUpperCase()} WAS WRITTEN`;
  const headingFont = canEncode(fonts.display, heading, fonts.displayMetrics) ? fonts.display : fonts.bodyBold;
  txt(page, heading, { x: MARGIN + 16, y: boxTop - 24, size: 10, font: headingFont, color: pal.goldDeep });
  let by = boxTop - 44;
  for (const lines of boxLines) {
    txt(page, "•", { x: MARGIN + 16, y: by, size: 10, font: fonts.body, color: pal.goldDeep });
    for (const line of lines) {
      txt(page, line, { x: MARGIN + 30, y: by, size: 10, font: fonts.body, color: pal.ink });
      by -= 13.5;
    }
    by -= 5;
  }
  y = boxTop - boxH - 26;

  drawParagraph(
    page,
    family
      ? `A cartouche is a transcription, not a translation: ${joinCartoucheNames(family.names)} as a scribe in Thebes might have heard them. To read the rest of what the scribes wrote, the first lesson of our course teaches the whole 25-sign alphabet in about half an hour, free, at ${SITE}.`
      : `A cartouche is a transcription, not a translation: ${name} as a scribe in Thebes might have heard it. To read the rest of what the scribes wrote, the first lesson of our course teaches the whole 25-sign alphabet in about half an hour, free, at ${SITE}.`,
    MARGIN,
    y,
    fonts.bodyItalic,
    10.5,
    14.5,
    w,
    pal.muted
  );

  drawFooter(page, fonts, pal, family ? familyFooter(fonts, family.names) : `The cartouche of ${name}`);
}

/** The footer's right-hand note for a family: every name if it fits beside the site's address, else a short one. */
function familyFooter(fonts: Fonts, names: string[]): string {
  const full = `The cartouches of ${joinCartoucheNames(names)}`;
  return fonts.bodyItalic.widthOfTextAtSize(full, 8.5) <= 200 ? full : "The family cartouches";
}

/**
 * The notes for several names at once: each name's own notes, without
 * repeats, and one line on reading direction in place of a line per name.
 */
export function familyWritingRules(resultsList: TransliterationResult[][]): string[] {
  const rules: string[] = [];
  for (const results of resultsList) {
    // writingRules ends with the reading-direction line whenever the name has a sign.
    const own = writingRules(results);
    for (const r of results.length ? own.slice(0, -1) : own) if (!rules.includes(r)) rules.push(r);
  }
  rules.push("In every cartouche the signs face the start of the name, so each one is read from its first sign onward, left to right.");
  return rules;
}

/**
 * Page one of a family print: two to four cartouches stacked, each with its
 * name under it, placed by familyPageLayout (shared with the preview and the
 * image) but measured with the real font, like the single page.
 */
function pageOneFamily(doc: PDFDocument, fonts: Fonts, pal: Palette, art: PDFImage | null, names: string[], resultsList: TransliterationResult[][]) {
  const page = doc.addPage([A4.width, A4.height]);
  if (art) {
    page.drawRectangle({ x: 0, y: 0, width: A4.width, height: A4.height, color: pal.page });
    page.drawImage(art, { x: 0, y: 0, width: A4.width, height: A4.height });
  } else {
    drawFrame(page, pal);
  }
  const H = A4.height;
  const runs = resultsList.map((results) => results.map((r) => r.mapping.glyph).join(""));
  const { slots, nameMax } = familyPageLayout(runs, (i, size) => glyphBounds(fonts.glyphMetrics, runs[i], size).width);

  drawCentered(page, "THE CARTOUCHES OF", H - FAMILY_BAND.kicker, fonts.display, 11, pal.goldDeep, 4);
  page.drawLine({
    start: { x: A4.width / 2 - 36, y: H - FAMILY_BAND.kicker - 12 },
    end: { x: A4.width / 2 + 36, y: H - FAMILY_BAND.kicker - 12 },
    thickness: 0.6,
    color: pal.gold,
  });

  slots.forEach((s, i) => {
    const loopY = H - s.loopTop - s.loopH; // the PDF's y runs up from the bottom
    drawCartouche(page, pal, s.loopX, loopY, s.loopW, s.loopH, Math.max(2, s.size / 22));
    const bounds = glyphBounds(fonts.glyphMetrics, runs[i], s.size);
    const inkMid = (bounds.minY + bounds.maxY) / 2;
    txt(page, runs[i], {
      x: s.loopX + (s.loopW - bounds.width) / 2 - bounds.minX,
      y: loopY + s.loopH / 2 - inkMid,
      size: s.size,
      font: fonts.glyph,
      color: pal.ink,
    });

    const upper = names[i].toUpperCase();
    const nameFont = canEncode(fonts.display, upper, fonts.displayMetrics) ? fonts.display : fonts.bodyBold;
    let nameSize = familyNameSize(upper, nameMax);
    while (nameFont.widthOfTextAtSize(upper, nameSize) + 2.5 * upper.length > A4.width - 2 * MARGIN && nameSize > 10) nameSize -= 1;
    drawCentered(page, upper, H - s.nameBaseline, nameFont, nameSize, pal.goldDeep, 2.5);
  });

  drawCentered(page, "written in ancient Egyptian hieroglyphs", H - FAMILY_BAND.caption, fonts.bodyItalic, 12.5, pal.muted);
  drawCentered(page, "each name read from left to right", H - FAMILY_BAND.captionSub, fonts.body, 9.5, pal.muted);
  drawFooter(page, fonts, pal, undefined, pal.footerInset);
}

/** Plain-English notes on the choices made for this particular name. */
export function writingRules(results: TransliterationResult[]): string[] {
  const inputs = results.map((r) => r.input);
  const rules: string[] = [];
  const has = (...letters: string[]) => letters.some((l) => inputs.includes(l));
  if (has("a"))
    rules.push(
      "The vulture stands in for the open 'a'. Egyptian had no sign for a pure vowel, and the vulture's sound (a catch in the throat) is the nearest a scribe could get."
    );
  if (has("i", "e", "y"))
    rules.push("The reed leaf is the 'i' sound, and does duty for 'e' and 'y' as well: to an Egyptian ear they were all the same semi-vowel.");
  if (has("o", "u")) rules.push("The quail chick is the 'w' sound, which is how Egyptian wrote the 'o' and 'u' of foreign names.");
  if (has("l", "r"))
    rules.push(
      "The mouth sign is 'r'. Egyptian did not distinguish 'l' from 'r', so both take the same sign, just as the Egyptians wrote the names of their Greek rulers."
    );
  if (has("sh", "ch", "th", "ph"))
    rules.push("A pair of letters that makes one sound in English (sh, ch, th, ph) gets one sign, because it was one sound in Egyptian too.");
  if (has("c"))
    rules.push(
      "A hard 'c' is written with the basket ('k'); a soft 'c' before e, i or y with the folded cloth ('s'), since the sign follows the sound, not the spelling."
    );
  if (results.some((r, i) => i > 0 && r.input === results[i - 1].input))
    rules.push("A doubled letter is written once. Two of the same sign side by side would have read as two sounds.");
  const first = results[0];
  if (first) rules.push(`The signs face the start of the name, so it is read from the ${first.mapping.signName.toLowerCase()} onward, left to right.`);
  return rules;
}

/** Build the whole PDF for `name`. Throws if the name yields no signs. */
export type BuildOptions = {
  /** "all" = the three pages the buyer downloads; "print" = page one alone, the artwork the print partner prints. */
  pages?: "all" | "print";
  /** An A3–A1 poster: the scene from public/cartouche-print/large/ (upscaled for the size), if it has one. */
  large?: boolean;
};

/**
 * `name` is one name, or a family of two to four: page one then stacks their
 * cartouches, the key gives each name its own pages, and the story covers
 * them all. One name (or a list of one) builds exactly the PDF it always did.
 */
export async function buildCartouchePrintPdf(
  name: string | readonly string[],
  theme: CartouchePrintThemeId = DEFAULT_CARTOUCHE_PRINT_THEME,
  options: BuildOptions = {},
): Promise<Uint8Array> {
  const list = (typeof name === "string" ? [name] : [...name])
    .map((n) => n.replace(/\s+/g, " ").trim())
    .filter((n) => transliterateName(n).length > 0);
  if (list.length === 0) throw new Error("Name has no signs");
  if (list.length >= 2) return buildFamilyPdf(list, theme, options);

  const clean = list[0];
  const results = transliterateName(clean);

  const bytes = await loadFontBytes();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`The cartouche of ${clean}`);
  doc.setAuthor("Learn Hieroglyphics");
  doc.setSubject("A name written in ancient Egyptian hieroglyphs, with a sign-by-sign key");
  doc.setProducer("learnhieroglyphics.com");
  doc.setCreationDate(new Date());

  const fonts: Fonts = {
    glyph: await doc.embedFont(bytes.glyph, { subset: true }),
    glyphMetrics: fontkit.create(bytes.glyph),
    display: await doc.embedFont(bytes.display, { subset: true }),
    displayMetrics: fontkit.create(bytes.display),
    body: await doc.embedFont(StandardFonts.TimesRoman),
    bodyBold: await doc.embedFont(StandardFonts.TimesRomanBold),
    bodyItalic: await doc.embedFont(StandardFonts.TimesRomanItalic),
  };

  // Body text is set in Times (WinAnsi): make every string it will carry encodable.
  const safeName = plainText(fonts.body, clean) || clean.replace(/[^ -~]/g, "") || "this name";
  const safeResults = results.map((r) => ({
    ...r,
    mapping: { ...r.mapping, signName: plainText(fonts.body, r.mapping.signName), note: plainText(fonts.body, r.mapping.note) },
  }));

  const pal = paletteFor(theme);
  const art = pal.art ? await doc.embedJpg(await loadArt(pal.art, options.large)) : null;
  pageOne(doc, fonts, pal, art, safeName, safeResults);
  if (options.pages !== "print") {
    pageSigns(doc, fonts, pal, safeName, safeResults);
    pageStory(doc, fonts, pal, safeName, safeResults);
  }

  return doc.save();
}

async function buildFamilyPdf(names: string[], theme: CartouchePrintThemeId, options: BuildOptions): Promise<Uint8Array> {
  const bytes = await loadFontBytes();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`The cartouches of ${joinCartoucheNames(names)}`);
  doc.setAuthor("Learn Hieroglyphics");
  doc.setSubject("Names written in ancient Egyptian hieroglyphs, with a sign-by-sign key");
  doc.setProducer("learnhieroglyphics.com");
  doc.setCreationDate(new Date());

  const fonts: Fonts = {
    glyph: await doc.embedFont(bytes.glyph, { subset: true }),
    glyphMetrics: fontkit.create(bytes.glyph),
    display: await doc.embedFont(bytes.display, { subset: true }),
    displayMetrics: fontkit.create(bytes.display),
    body: await doc.embedFont(StandardFonts.TimesRoman),
    bodyBold: await doc.embedFont(StandardFonts.TimesRomanBold),
    bodyItalic: await doc.embedFont(StandardFonts.TimesRomanItalic),
  };

  // Body text is set in Times (WinAnsi): make every string it will carry encodable, as for one name.
  const safeNames = names.map((n) => plainText(fonts.body, n) || n.replace(/[^ -~]/g, "") || "this name");
  const safeResults = names.map((n) =>
    transliterateName(n).map((r) => ({
      ...r,
      mapping: { ...r.mapping, signName: plainText(fonts.body, r.mapping.signName), note: plainText(fonts.body, r.mapping.note) },
    })),
  );

  const pal = paletteFor(theme);
  const art = pal.art ? await doc.embedJpg(await loadArt(pal.art, options.large)) : null;
  pageOneFamily(doc, fonts, pal, art, safeNames, safeResults);
  if (options.pages !== "print") {
    // Each name keeps its own key (a fresh page each), then one story for them all.
    safeNames.forEach((n, i) => pageSigns(doc, fonts, pal, n, safeResults[i]));
    pageStory(doc, fonts, pal, safeNames[0], safeResults[0], { names: safeNames, results: safeResults });
  }

  return doc.save();
}

/**
 * The Class Cartouche Set (src/lib/class-set.ts): every pupil's page one, in the order given, then a class page
 * (or two) listing each name beside its signs and letters. Fonts and the paper's artwork are embedded once and
 * reused on every page, so a class of 40 stays a small file. Names that give no signs are left out.
 */
export async function buildClassSetPdf(
  names: readonly string[],
  theme: CartouchePrintThemeId = DEFAULT_CARTOUCHE_PRINT_THEME,
): Promise<Uint8Array> {
  const list = names.map((n) => n.replace(/\s+/g, " ").trim()).filter((n) => transliterateName(n).length > 0);
  if (list.length === 0) throw new Error("No names with signs");

  const bytes = await loadFontBytes();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Class Cartouche Set (${list.length} names)`);
  doc.setAuthor("Learn Hieroglyphics");
  doc.setSubject("Each pupil's name written in ancient Egyptian hieroglyphs, one page each, with a class page");
  doc.setProducer("learnhieroglyphics.com");
  doc.setCreationDate(new Date());

  const fonts: Fonts = {
    glyph: await doc.embedFont(bytes.glyph, { subset: true }),
    glyphMetrics: fontkit.create(bytes.glyph),
    display: await doc.embedFont(bytes.display, { subset: true }),
    displayMetrics: fontkit.create(bytes.display),
    body: await doc.embedFont(StandardFonts.TimesRoman),
    bodyBold: await doc.embedFont(StandardFonts.TimesRomanBold),
    bodyItalic: await doc.embedFont(StandardFonts.TimesRomanItalic),
  };

  // Body text is set in Times (WinAnsi): make every string it will carry encodable, as for one name.
  const pupils = list.map((n) => ({
    name: plainText(fonts.body, n) || n.replace(/[^ -~]/g, "") || "this name",
    results: transliterateName(n).map((r) => ({
      ...r,
      mapping: { ...r.mapping, signName: plainText(fonts.body, r.mapping.signName), note: plainText(fonts.body, r.mapping.note) },
    })),
  }));

  const pal = paletteFor(theme);
  const art = pal.art ? await doc.embedJpg(await loadArt(pal.art)) : null;
  for (const p of pupils) pageOne(doc, fonts, pal, art, p.name, p.results);
  // the class list is printed on Cream whatever the pupils' paper: an art paper's flat colour behind a list is all ink
  pageClassList(doc, fonts, paletteFor("cream"), pupils);

  return doc.save();
}

/** The class page: every name, its signs and the letters each sign stands for, as many pages as it takes. */
function pageClassList(doc: PDFDocument, fonts: Fonts, pal: Palette, pupils: { name: string; results: TransliterationResult[] }[]) {
  const rowH = 27;
  const top = A4.height - 150;
  const bottom = 78;
  const perPage = Math.floor((top - bottom) / rowH) + 1;
  const nameX = MARGIN + 10;
  const glyphX = MARGIN + 150;
  const glyphMaxW = A4.width - glyphX - MARGIN - 10;

  for (let start = 0; start < pupils.length; start += perPage) {
    const page = doc.addPage([A4.width, A4.height]);
    drawFrame(page, pal);
    drawCentered(page, "OUR CLASS IN HIEROGLYPHS", A4.height - 92, fonts.display, 15, pal.goldDeep, 3);
    drawCentered(page, "Each name as an Egyptian scribe would have spelled it, sound by sound", A4.height - 114, fonts.bodyItalic, 11, pal.muted);

    pupils.slice(start, start + perPage).forEach((p, i) => {
      const y = top - i * rowH;
      // long names shrink to stay clear of the signs column
      let nameSize = 12;
      while (fonts.bodyBold.widthOfTextAtSize(p.name, nameSize) > glyphX - nameX - 10 && nameSize > 7) nameSize -= 0.5;
      txt(page, p.name, { x: nameX, y, size: nameSize, font: fonts.bodyBold, color: pal.ink });
      const glyphs = p.results.map((r) => r.mapping.glyph).join("");
      let size = 19;
      while (glyphBounds(fonts.glyphMetrics, glyphs, size).width > glyphMaxW * 0.62 && size > 10) size -= 1;
      const glyphW = glyphBounds(fonts.glyphMetrics, glyphs, size).width;
      txt(page, glyphs, { x: glyphX, y: y - 1, size, font: fonts.glyph, color: pal.ink });
      // the letters each sign stands for, in what room is left: spaced out for short names, tight for long ones
      const lettersX = glyphX + glyphW + 14;
      const room = A4.width - MARGIN - 6 - lettersX;
      const parts = p.results.map((r) => r.input.toUpperCase());
      let letters = parts.join(" - ");
      let lettersSize = 9.5;
      if (fonts.body.widthOfTextAtSize(letters, lettersSize) > room) letters = parts.join("-");
      while (fonts.body.widthOfTextAtSize(letters, lettersSize) > room && lettersSize > 6.5) lettersSize -= 0.5;
      while (fonts.body.widthOfTextAtSize(`${letters}…`, lettersSize) > room && letters.length > 1) letters = letters.slice(0, -1);
      if (letters !== parts.join(" - ") && letters !== parts.join("-")) letters = `${letters}…`;
      txt(page, letters, { x: lettersX, y, size: lettersSize, font: fonts.body, color: pal.muted });
      page.drawLine({ start: { x: MARGIN, y: y - 9 }, end: { x: A4.width - MARGIN, y: y - 9 }, thickness: 0.4, color: pal.rule });
    });

    const pageNo = Math.floor(start / perPage) + 1;
    const pages = Math.ceil(pupils.length / perPage);
    drawFooter(page, fonts, pal, pages > 1 ? `Class page ${pageNo} of ${pages}` : undefined);
  }
}
