/**
 * Builds the Ancient Egypt Writing Unit PDF (server only), on A4 or US Letter.
 *
 *   full:   cover, how to use the unit, five lessons (teacher plan, then the pupil worksheets), the end-of-unit
 *           quiz, the answer key.
 *   sample: cover, how to use the unit, Lesson 1 complete with its answers, and what the full unit adds.
 *
 * White pages and thin lines, for a school photocopier. The content is data (src/lib/unit-pack/content.ts);
 * this file only lays it out, flowing onto a new page when one fills, so the same content fits both papers.
 * Fonts travel as base64 (src/lib/unit-pack/fonts.ts), so no route needs file tracing.
 *
 * pdf-lib gotchas, as in src/lib/cartouche-print-pdf.ts: the standard fonts are WinAnsi (no Egyptological
 * letters: anything they cannot set is dropped by `latin`), and the page font is set once per change.
 */
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, type RGB } from "pdf-lib";
import {
  ALPHABET_CHART,
  LESSONS,
  LICENCE_LINE,
  QUIZ_A,
  QUIZ_B,
  QUIZ_C,
  QUIZ_MARKS,
  QUIZ_WRITE_NAME,
  UNIT_CONTENTS,
  nameGlyphs,
  nameKey,
  nameLetters,
  type Block,
  type Lesson,
} from "@/lib/unit-pack/content";
import { UNIT_DISPLAY_FONT, UNIT_GLYPH_FONT } from "@/lib/unit-pack/fonts";
import { UNIT_PACK, type Paper } from "@/lib/unit-pack/product";

export const PAPER_SIZE: Record<Paper, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const SIDE = 50;
/** Text area top and bottom. Letter is 50 pt shorter than A4: it gets narrower bands and slightly tighter drawings (Layout.k). */
const TOP: Record<Paper, number> = { a4: 58, letter: 52 };
const BOTTOM: Record<Paper, number> = { a4: 58, letter: 52 };

const C = {
  ink: rgb(0.16, 0.13, 0.1),
  muted: rgb(0.42, 0.36, 0.29),
  gold: rgb(0.63, 0.48, 0.11),
  goldDeep: rgb(0.48, 0.36, 0.08),
  tint: rgb(0.97, 0.94, 0.86),
  rule: rgb(0.85, 0.8, 0.67),
  white: rgb(1, 1, 1),
};

type Fonts = { glyph: PDFFont; display: PDFFont; body: PDFFont; bold: PDFFont; italic: PDFFont };

const b64 = (s: string) => Uint8Array.from(Buffer.from(s, "base64"));

/* ── Text ─────────────────────────────────────────────────────────────── */

const isGlyph = (ch: string) => {
  const cp = ch.codePointAt(0)!;
  return cp >= 0x13000 && cp <= 0x1345f;
};

const encodable = new Map<string, boolean>();
/** Drop what the WinAnsi fonts cannot set (the content avoids it; this is the safety net). */
function latin(font: PDFFont, text: string): string {
  let out = "";
  for (const ch of text) {
    const key = `${font.name}:${ch}`;
    let ok = encodable.get(key);
    if (ok === undefined) {
      try {
        font.encodeText(ch);
        ok = true;
      } catch {
        ok = false;
      }
      encodable.set(key, ok);
    }
    if (ok) out += ch;
  }
  return out;
}

type Run = { text: string; font: PDFFont; size: number; glyph: boolean };
type Word = Run[];
type Style = { size: number; font?: PDFFont; color?: RGB };

class Layout {
  doc: PDFDocument;
  f: Fonts;
  W: number;
  H: number;
  page!: PDFPage;
  y = 0;
  pageFont = new WeakMap<PDFPage, PDFFont>();
  header = "";
  sample: boolean;
  paper: Paper;
  /** Vertical scale for drawings and writing space: 1 on A4, a little less on Letter. */
  k: number;

  constructor(doc: PDFDocument, fonts: Fonts, paper: Paper, sample: boolean) {
    this.doc = doc;
    this.f = fonts;
    this.W = PAPER_SIZE[paper].width;
    this.H = PAPER_SIZE[paper].height;
    this.sample = sample;
    this.paper = paper;
    this.k = paper === "letter" ? 0.8 : 1;
  }

  get left() {
    return SIDE;
  }
  get right() {
    return this.W - SIDE;
  }
  get width() {
    return this.W - 2 * SIDE;
  }

  newPage(header = this.header, plain = false) {
    this.header = header;
    this.page = this.doc.addPage([this.W, this.H]);
    this.y = this.H - TOP[this.paper];
    if (!plain) this.decorate();
  }

  /** Room for `h` more points on this page, or a new one. */
  ensure(h: number) {
    if (this.y - h < BOTTOM[this.paper]) this.newPage();
  }

  /** The thin running head and foot every page carries. */
  decorate() {
    const p = this.page;
    p.drawLine({ start: { x: SIDE, y: this.H - 38 }, end: { x: this.W - SIDE, y: this.H - 38 }, thickness: 0.6, color: C.rule });
    this.spaced("ANCIENT EGYPT WRITING UNIT", SIDE, this.H - 32, this.f.display, 7.5, C.goldDeep, 1.4);
    if (this.header) {
      const t = latin(this.f.italic, this.header);
      this.text(t, this.W - SIDE - this.f.italic.widthOfTextAtSize(t, 8.5), this.H - 32, this.f.italic, 8.5, C.muted);
    }
    p.drawLine({ start: { x: SIDE, y: 40 }, end: { x: this.W - SIDE, y: 40 }, thickness: 0.6, color: C.rule });
    const foot = this.sample ? "Free sample  ·  learnhieroglyphics.com/teachers/unit-pack" : "learnhieroglyphics.com/teachers  ·  licensed for one teacher's classes";
    this.text(foot, SIDE, 28, this.f.body, 7.5, C.muted);
    const n = String(this.doc.getPageCount());
    this.text(n, this.W - SIDE - this.f.body.widthOfTextAtSize(n, 8), 28, this.f.body, 8, C.muted);
  }

  text(t: string, x: number, y: number, font: PDFFont, size: number, color: RGB) {
    if (!t) return;
    if (this.pageFont.get(this.page) !== font) {
      this.page.setFont(font);
      this.pageFont.set(this.page, font);
    }
    this.page.drawText(t, { x, y, size, color });
  }

  /** Letter-spaced display text (pdf-lib has no tracking option). */
  spaced(t: string, x: number, y: number, font: PDFFont, size: number, color: RGB, spacing: number) {
    for (const ch of t) {
      this.text(ch, x, y, font, size, color);
      x += font.widthOfTextAtSize(ch, size) + spacing;
    }
  }

  spacedWidth(t: string, font: PDFFont, size: number, spacing: number) {
    return font.widthOfTextAtSize(t, size) + spacing * Math.max(0, [...t].length - 1);
  }

  /** Split text into words of runs: **bold** toggles, hieroglyphs go to the glyph font. */
  words(text: string, s: Style): Word[] {
    const base = s.font ?? this.f.body;
    const gsize = s.size * 1.6;
    const words: Word[] = [];
    let bold = false;
    let word: Word = [];
    const push = (ch: string) => {
      const glyph = isGlyph(ch);
      const font = glyph ? this.f.glyph : bold ? this.f.bold : base;
      const last = word[word.length - 1];
      if (last && last.font === font) last.text += ch;
      else word.push({ text: ch, font, size: glyph ? gsize : s.size, glyph });
    };
    const parts = text.split("**");
    parts.forEach((part, i) => {
      bold = i % 2 === 1;
      for (const ch of part) {
        if (ch === " " || ch === "\n") {
          if (word.length) words.push(word);
          word = [];
        } else {
          push(ch);
        }
      }
    });
    if (word.length) words.push(word);
    for (const w of words) for (const r of w) if (!r.glyph) r.text = latin(r.font, r.text);
    return words;
  }

  wordWidth(w: Word) {
    return w.reduce((sum, r) => sum + r.font.widthOfTextAtSize(r.text, r.size), 0);
  }

  lines(text: string, s: Style, maxWidth: number): Word[][] {
    const space = (s.font ?? this.f.body).widthOfTextAtSize(" ", s.size);
    const out: Word[][] = [];
    let line: Word[] = [];
    let width = 0;
    for (const w of this.words(text, s)) {
      const ww = this.wordWidth(w);
      if (line.length && width + space + ww > maxWidth) {
        out.push(line);
        line = [w];
        width = ww;
      } else {
        width += (line.length ? space : 0) + ww;
        line.push(w);
      }
    }
    if (line.length) out.push(line);
    return out;
  }

  lineHeight(line: Word[], size: number) {
    return line.some((w) => w.some((r) => r.glyph)) ? size * 2.15 : size * 1.42;
  }

  measure(text: string, s: Style, maxWidth: number) {
    return this.lines(text, s, maxWidth).reduce((h, l) => h + this.lineHeight(l, s.size), 0);
  }

  /** Draw wrapped rich text with its top at `top`; returns the height used. Does not paginate. */
  drawRich(text: string, x: number, top: number, s: Style, maxWidth: number, align: "left" | "center" = "left") {
    const space = (s.font ?? this.f.body).widthOfTextAtSize(" ", s.size);
    let y = top;
    for (const line of this.lines(text, s, maxWidth)) {
      const lh = this.lineHeight(line, s.size);
      const base = y - lh + s.size * 0.42 + (lh > s.size * 1.5 ? s.size * 0.12 : 0);
      const lineWidth = line.reduce((sum, w) => sum + this.wordWidth(w), 0) + space * (line.length - 1);
      let cx = align === "center" ? x + (maxWidth - lineWidth) / 2 : x;
      for (const w of line) {
        for (const r of w) {
          this.text(r.text, cx, r.glyph ? base - s.size * 0.12 : base, r.font, r.size, s.color ?? C.ink);
          cx += r.font.widthOfTextAtSize(r.text, r.size);
        }
        cx += space;
      }
      y -= lh;
    }
    return top - y;
  }

  /** A paragraph in the flow, breaking across pages line by line. */
  para(text: string, s: Style = { size: 10.5 }, indent = 0, after = 6) {
    for (const line of this.lines(text, s, this.width - indent)) {
      const lh = this.lineHeight(line, s.size);
      this.ensure(lh);
      const joined = line.map((w) => w.map((r) => r.text).join("")).join(" ");
      void joined;
      this.drawLine(line, this.left + indent, this.y, s);
      this.y -= lh;
    }
    this.y -= after;
  }

  drawLine(line: Word[], x: number, top: number, s: Style) {
    const space = (s.font ?? this.f.body).widthOfTextAtSize(" ", s.size);
    const lh = this.lineHeight(line, s.size);
    const base = top - lh + s.size * 0.42 + (lh > s.size * 1.5 ? s.size * 0.12 : 0);
    let cx = x;
    for (const w of line) {
      for (const r of w) {
        this.text(r.text, cx, r.glyph ? base - s.size * 0.12 : base, r.font, r.size, s.color ?? C.ink);
        cx += r.font.widthOfTextAtSize(r.text, r.size);
      }
      cx += space;
    }
  }

  glyphWidth(glyphs: string, size: number) {
    return this.f.glyph.widthOfTextAtSize(glyphs, size);
  }
}

/* ── Shapes ───────────────────────────────────────────────────────────── */

/** A cartouche loop with the knot bar off the right end; (x, y) is its bottom-left. */
function cartoucheShape(L: Layout, x: number, y: number, w: number, h: number, stroke = 1.6) {
  const loop = (width: number, height: number) => {
    const r = height / 2;
    return `M ${r} 0 H ${width - r} A ${r} ${r} 0 0 1 ${width - r} ${height} H ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  };
  L.page.drawSvgPath(loop(w, h), { x, y: y + h, borderColor: C.gold, borderWidth: stroke });
  const inset = stroke * 2;
  L.page.drawSvgPath(loop(w - 2 * inset, h - 2 * inset), { x: x + inset, y: y + h - inset, borderColor: C.gold, borderWidth: 0.5 });
  const barH = h * 0.44;
  L.page.drawRectangle({ x: x + w + 3, y: y + (h - barH) / 2, width: stroke * 3, height: barH, borderColor: C.gold, borderWidth: stroke * 0.8 });
}

function answerBox(L: Layout, x: number, y: number, w = 20, h = 22) {
  L.page.drawRectangle({ x, y, width: w, height: h, borderColor: C.muted, borderWidth: 0.7 });
}

function tickBox(L: Layout, x: number, y: number, size = 10) {
  L.page.drawRectangle({ x, y, width: size, height: size, borderColor: C.muted, borderWidth: 0.7 });
}

/** The numbered disc of a task heading; a star for the challenge. */
function badge(L: Layout, n: string, cx: number, cy: number) {
  L.page.drawCircle({ x: cx, y: cy, size: 9, color: C.gold });
  if (n === "★") {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 6 : 2.6;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`);
    }
    L.page.drawSvgPath(`M ${pts.join(" L ")} Z`, { x: cx, y: cy, color: C.white });
    return;
  }
  const w = L.f.bold.widthOfTextAtSize(n, 10);
  L.text(n, cx - w / 2, cy - 3.6, L.f.bold, 10, C.white);
}

function heading(L: Layout, text: string, size = 13) {
  L.ensure(size + 30);
  L.y -= 4;
  L.text(latin(L.f.display, text), L.left, L.y - size, L.f.display, size, C.goldDeep);
  L.y -= size + 6;
  L.page.drawLine({ start: { x: L.left, y: L.y }, end: { x: L.left + 60, y: L.y }, thickness: 1, color: C.gold });
  L.y -= 10;
}

function subheading(L: Layout, text: string) {
  L.ensure(70); // keep the heading with what follows
  L.y -= 2;
  L.text(latin(L.f.bold, text.toUpperCase()), L.left, L.y - 9, L.f.bold, 8.5, C.gold);
  L.y -= 17;
}

function bullets(L: Layout, items: string[], size = 10) {
  for (const item of items) {
    const h = L.measure(item, { size }, L.width - 14);
    L.ensure(Math.min(h, 40));
    L.page.drawCircle({ x: L.left + 4, y: L.y - size * 0.68, size: 1.6, color: C.gold });
    L.para(item, { size }, 14, 2.5);
  }
  L.y -= 4;
}

function box(L: Layout, title: string, text: string, size = 10) {
  const pad = 10;
  const titleH = title ? 16 : 0;
  const h = L.measure(text, { size }, L.width - 2 * pad) + titleH + 2 * pad - 2;
  L.ensure(h + 8);
  L.page.drawRectangle({ x: L.left, y: L.y - h, width: L.width, height: h, color: C.tint, borderColor: C.rule, borderWidth: 0.6 });
  L.page.drawRectangle({ x: L.left, y: L.y - h, width: 2.5, height: h, color: C.gold });
  if (title) L.text(latin(L.f.bold, title), L.left + pad, L.y - pad - 9, L.f.bold, 10, C.goldDeep);
  L.drawRich(text, L.left + pad, L.y - pad - titleH, { size }, L.width - 2 * pad);
  L.y -= h + 10;
}

function writingLines(L: Layout, n: number, gap = 24) {
  gap *= L.k;
  for (let i = 0; i < n; i++) {
    L.ensure(gap);
    L.y -= gap;
    L.page.drawLine({ start: { x: L.left, y: L.y }, end: { x: L.right, y: L.y }, thickness: 0.5, color: C.rule });
  }
  L.y -= 10;
}

/** A cartouche in the flow: holding signs (centred, optional answer boxes under each) or empty to write in. */
function cartoucheBlock(L: Layout, glyphs: string | undefined, boxes = 0, caption?: string) {
  const size = 30;
  const h = glyphs ? 56 : Math.round(74 * L.k);
  const signs = glyphs ? [...glyphs] : [];
  const gap = 8;
  const widths = signs.map((g) => Math.max(L.glyphWidth(g, size), boxes ? 22 : 0));
  const inner = glyphs ? widths.reduce((a, b) => a + b, 0) + gap * (signs.length - 1) : L.width * 0.78;
  const w = Math.min(L.width - 20, inner + 44);
  const total = h + (boxes ? 34 : 0) + (caption ? 16 : 0) + 14;
  L.ensure(total);
  if (caption) {
    L.text(latin(L.f.italic, caption), L.left, L.y - 10, L.f.italic, 9.5, C.muted);
    L.y -= 16;
  }
  const x = L.left + (L.width - w) / 2 - 4;
  const y = L.y - h - 4;
  cartoucheShape(L, x, y, w, h);
  if (glyphs) {
    let cx = x + (w - inner) / 2;
    signs.forEach((g, i) => {
      const gw = L.glyphWidth(g, size);
      L.text(g, cx + (widths[i] - gw) / 2, y + h / 2 - size * 0.36, L.f.glyph, size, C.ink);
      if (boxes && i < boxes) answerBox(L, cx + (widths[i] - 20) / 2, y - 30);
      cx += widths[i] + gap;
    });
  }
  L.y = y - (boxes ? 34 : 0) - 12;
}

function decodeBlock(L: Layout, rows: { glyphs: string; boxes: number; hint?: string }[]) {
  const size = 24;
  const widthOf = (g: string) => L.glyphWidth(g, size) + [...g].length * 4;
  // The answer boxes start at one x for every row, after the widest cartouche.
  const boxX = L.left + Math.max(90, ...rows.map((r) => widthOf(r.glyphs) + 34)) + 34;
  for (const row of rows) {
    const h = 50;
    L.ensure(h + 8);
    const gw = widthOf(row.glyphs);
    const cw = Math.max(90, gw + 34);
    const top = L.y;
    cartoucheShape(L, L.left + 4, top - h + 6, cw, 40, 1.3);
    let cx = L.left + 4 + (cw - gw) / 2 + 2;
    for (const g of row.glyphs) {
      L.text(g, cx, top - h + 6 + 20 - size * 0.36, L.f.glyph, size, C.ink);
      cx += L.glyphWidth(g, size) + 4;
    }
    let bx = boxX;
    for (let i = 0; i < row.boxes; i++) {
      answerBox(L, bx, top - h + 15);
      bx += 25;
    }
    L.text("=", bx + 6, top - h + 21, L.f.bold, 12, C.muted);
    L.page.drawLine({ start: { x: bx + 22, y: top - h + 16 }, end: { x: L.right, y: top - h + 16 }, thickness: 0.5, color: C.rule });
    L.y -= h + 6;
  }
  L.y -= 4;
}

function tableBlock(L: Layout, b: Extract<Block, { k: "table" }>, compact = false) {
  const size = compact ? 9 : 9.5;
  const pad = compact ? 4 : 6;
  const big = new Set(b.big ?? []);
  const xs: number[] = [];
  let acc = L.left;
  for (const f of b.widths) {
    xs.push(acc);
    acc += f * L.width;
  }
  const colW = b.widths.map((f) => f * L.width);
  const cellH = (cells: string[], bold: boolean) =>
    Math.max(
      b.rowHeight ?? 0,
      ...cells.map((c, i) => {
        if (big.has(i) && [...c].every((ch) => isGlyph(ch))) return 34;
        return L.measure(c, { size, font: bold ? L.f.bold : L.f.body }, colW[i] - 2 * pad) + 2 * pad;
      }),
    );
  const drawRow = (cells: string[], header: boolean) => {
    const h = cellH(cells, header);
    L.ensure(h);
    const top = L.y;
    L.page.drawRectangle({ x: L.left, y: top - h, width: L.width, height: h, borderColor: C.rule, borderWidth: 0.6, ...(header ? { color: C.tint } : {}) });
    cells.forEach((c, i) => {
      if (i > 0) L.page.drawLine({ start: { x: xs[i], y: top }, end: { x: xs[i], y: top - h }, thickness: 0.6, color: C.rule });
      if (!c) return;
      if (big.has(i) && [...c].every((ch) => isGlyph(ch))) {
        const gs = 22;
        const gw = L.glyphWidth(c, gs);
        L.text(c, xs[i] + (colW[i] - gw) / 2, top - h / 2 - gs * 0.3, L.f.glyph, gs, C.ink);
        return;
      }
      L.drawRich(c, xs[i] + pad, top - pad + 1, { size, font: header ? L.f.bold : L.f.body }, colW[i] - 2 * pad, header ? "left" : "left");
    });
    L.y -= h;
  };
  if (b.head) drawRow(b.head, !b.head.every((c) => [...c].every((ch) => isGlyph(ch))));
  for (const r of b.rows) drawRow(r, false);
  L.y -= 12;
}

function tfBlock(L: Layout, items: string[]) {
  const size = 10;
  const textW = L.width - 120;
  L.ensure(20);
  L.text("True", L.right - 82, L.y - 9, L.f.bold, 8.5, C.muted);
  L.text("False", L.right - 36, L.y - 9, L.f.bold, 8.5, C.muted);
  L.y -= 14;
  items.forEach((item, i) => {
    const h = Math.max(24, L.measure(item, { size }, textW) + 10);
    L.ensure(h);
    L.text(`${i + 1}.`, L.left, L.y - 13, L.f.bold, size, C.gold);
    L.drawRich(item, L.left + 18, L.y - 3, { size }, textW);
    tickBox(L, L.right - 76, L.y - 15);
    tickBox(L, L.right - 30, L.y - 15);
    L.y -= h;
    L.page.drawLine({ start: { x: L.left, y: L.y + 3 }, end: { x: L.right, y: L.y + 3 }, thickness: 0.3, color: C.rule });
  });
  L.y -= 10;
}

function mcqBlock(L: Layout, items: { q: string; options: readonly string[] }[], start = 1) {
  const size = 10;
  items.forEach((item, i) => {
    const qh = L.measure(item.q, { size, font: L.f.bold }, L.width - 18);
    const optH = item.options.some((o) => [...o].some(isGlyph)) ? 26 : 18;
    L.ensure(qh + optH + 8);
    L.text(`${start + i}.`, L.left, L.y - 11, L.f.bold, size, C.gold);
    L.y -= L.drawRich(item.q, L.left + 18, L.y, { size, font: L.f.bold }, L.width - 18);
    // Options side by side when they fit, else one per line.
    const letters = ["a", "b", "c", "d"];
    const colW = (L.width - 18) / item.options.length;
    const fits = item.options.every((o) => L.measure(`${letters[0]}) ${o}`, { size }, colW - 20) <= optH);
    if (fits) {
      item.options.forEach((o, j) => {
        const x = L.left + 18 + j * colW;
        tickBox(L, x, L.y - optH + 6);
        L.drawRich(`${letters[j]})  ${o}`, x + 15, L.y - (optH - 18) / 2 - 1, { size }, colW - 20);
      });
      L.y -= optH + 6;
    } else {
      item.options.forEach((o, j) => {
        L.ensure(optH);
        tickBox(L, L.left + 18, L.y - optH + 6);
        L.drawRich(`${letters[j]})  ${o}`, L.left + 33, L.y - (optH - 18) / 2 - 1, { size }, L.width - 40);
        L.y -= optH;
      });
      L.y -= 6;
    }
  });
  L.y -= 6;
}

function matchBlock(L: Layout, left: string[], right: string[]) {
  const rowH = Math.round(36 * L.k);
  const h = Math.max(left.length, right.length) * rowH;
  L.ensure(h + 10);
  const top = L.y;
  left.forEach((g, i) => {
    const y = top - i * rowH - rowH / 2;
    L.text(g, L.left + 30, y - 9, L.f.glyph, 26, C.ink);
    L.page.drawCircle({ x: L.left + 90, y, size: 2.6, color: C.gold });
  });
  right.forEach((t, i) => {
    const y = top - i * rowH - rowH / 2;
    L.page.drawCircle({ x: L.left + L.width * 0.48, y, size: 2.6, color: C.gold });
    L.text(latin(L.f.body, t), L.left + L.width * 0.48 + 12, y - 3.5, L.f.body, 10.5, C.ink);
  });
  L.y -= h + 10;
}

/** The Rosetta Stone in outline: a broken slab, three bands, a label line for each. */
function rosettaBlock(L: Layout) {
  const h = Math.round(200 * L.k);
  L.ensure(h + 14);
  const top = L.y - 6;
  const x = L.left + 6;
  const w = L.width * 0.5;
  const bottom = top - h;
  // The slab, with its broken top edge (the hieroglyphic band lost most of its lines).
  const path = `M 0 ${h} L 0 ${h * 0.34} L ${w * 0.18} ${h * 0.22} L ${w * 0.36} ${h * 0.12} L ${w * 0.55} ${h * 0.05} L ${w * 0.72} ${h * 0.1} L ${w * 0.86} ${h * 0.02} L ${w} ${h * 0.14} L ${w} ${h} Z`;
  L.page.drawSvgPath(path, { x, y: top, color: rgb(0.93, 0.91, 0.87), borderColor: C.muted, borderWidth: 1 });
  const b1 = bottom + h * 0.62;
  const b2 = bottom + h * 0.33;
  L.page.drawLine({ start: { x, y: b1 }, end: { x: x + w, y: b1 }, thickness: 0.6, color: C.muted });
  L.page.drawLine({ start: { x, y: b2 }, end: { x: x + w, y: b2 }, thickness: 0.6, color: C.muted });
  // Band 1: a few signs, faint.
  const signs = "𓊪𓏏𓍯𓃭𓐝𓇌𓋴𓅓𓈖𓂋𓇋";
  L.text(signs, x + 14, b1 + 10, L.f.glyph, 12, C.muted);
  L.text("𓈖𓅓𓇋𓂋𓏏𓊪𓋴", x + 14 + w * 0.08, b1 + 30, L.f.glyph, 12, C.muted);
  // Band 2: running hand (demotic), as wavy strokes.
  for (let r = 0; r < 4; r++) {
    const y = b2 + 12 + r * 12;
    let d = `M 0 0`;
    for (let i = 0; i < 18; i++) d += ` q 4 ${i % 2 ? 3 : -3} 8 0`;
    L.page.drawSvgPath(d, { x: x + 12, y, borderColor: C.muted, borderWidth: 0.6 });
  }
  // Band 3: Greek capitals, as short strokes.
  for (let r = 0; r < 5; r++) {
    const y = bottom + 10 + r * 10.5;
    for (let i = 0; i < 26; i++) {
      const sx = x + 12 + i * ((w - 24) / 26);
      L.page.drawLine({ start: { x: sx, y }, end: { x: sx + 3.2, y: y + 5 }, thickness: 0.6, color: C.muted });
    }
  }
  // Labels.
  const lx = x + w + 30;
  [b1 + (top - b1) / 2 - 10, b2 + (b1 - b2) / 2, bottom + (b2 - bottom) / 2].forEach((y, i) => {
    L.page.drawLine({ start: { x: x + w + 4, y }, end: { x: lx - 6, y }, thickness: 0.5, color: C.gold, dashArray: [2, 2] });
    L.text(`${i + 1}.`, lx, y - 3.5, L.f.bold, 10.5, C.gold);
    L.page.drawLine({ start: { x: lx + 16, y: y - 4 }, end: { x: L.right, y: y - 4 }, thickness: 0.5, color: C.rule });
  });
  L.y = bottom - 16;
}

function chartBlock(L: Layout) {
  const cols = 5;
  const cw = L.width / cols;
  const ch = Math.round(64 * L.k);
  const rows = Math.ceil(ALPHABET_CHART.length / cols);
  L.ensure(rows * ch + 10);
  const top = L.y;
  ALPHABET_CHART.forEach((s, i) => {
    const x = L.left + (i % cols) * cw;
    const y = top - Math.floor(i / cols) * ch;
    L.page.drawRectangle({ x: x + 1.5, y: y - ch + 1.5, width: cw - 3, height: ch - 3, borderColor: C.rule, borderWidth: 0.6 });
    const gs = Math.round(26 * L.k);
    L.text(s.glyph, x + 10, y - ch * 0.56, L.f.glyph, gs, C.ink);
    const sound = latin(L.f.bold, s.sound);
    const ss = sound.length > 6 ? 9 : 13;
    L.text(sound, x + cw - 8 - L.f.bold.widthOfTextAtSize(sound, ss), y - 22, L.f.bold, ss, C.goldDeep);
    const pic = latin(L.f.italic, s.picture);
    L.text(pic, x + 8, y - ch + 8, L.f.italic, 8, C.muted);
  });
  L.y = top - rows * ch - 10;
}

function blocks(L: Layout, list: Block[]) {
  for (const b of list) {
    switch (b.k) {
      case "break":
        L.newPage();
        break;
      case "space":
        L.y -= b.h;
        break;
      case "h":
        heading(L, b.text, 12);
        break;
      case "p":
        L.para(b.text, { size: 10.5, color: b.muted ? C.muted : C.ink }, 0, 8);
        break;
      case "bullets":
        bullets(L, b.items);
        break;
      case "task": {
        const th = L.measure(b.title, { size: 12, font: L.f.bold }, L.width - 26);
        L.ensure(th + (b.text ? 40 : 10));
        L.y -= 6;
        badge(L, b.n, L.left + 9, L.y - 8);
        L.y -= L.drawRich(b.title, L.left + 26, L.y + 1, { size: 12, font: L.f.bold }, L.width - 26);
        L.y -= 2;
        if (b.text) L.para(b.text, { size: 10.5 }, 26, 8);
        else L.y -= 4;
        break;
      }
      case "lines":
        writingLines(L, b.n);
        break;
      case "cartouche":
        cartoucheBlock(L, b.glyphs, b.boxes, b.caption);
        break;
      case "decode":
        decodeBlock(L, b.rows);
        break;
      case "table":
        tableBlock(L, b);
        break;
      case "tf":
        tfBlock(L, b.items);
        break;
      case "mcq":
        mcqBlock(L, b.items, b.start);
        break;
      case "match":
        matchBlock(L, b.left, b.right);
        break;
      case "rosetta":
        rosettaBlock(L);
        break;
      case "chart":
        chartBlock(L);
        break;
      case "box":
        box(L, b.title, b.text);
        break;
    }
  }
}

/* ── Pages ────────────────────────────────────────────────────────────── */

function cover(L: Layout) {
  L.newPage("", true);
  const W = L.W;
  // A double frame.
  L.page.drawRectangle({ x: 30, y: 30, width: W - 60, height: L.H - 60, borderColor: C.gold, borderWidth: 1.4 });
  L.page.drawRectangle({ x: 36, y: 36, width: W - 72, height: L.H - 72, borderColor: C.rule, borderWidth: 0.5 });
  let y = L.H - 150;
  const center = (t: string, font: PDFFont, size: number, color: RGB, spacing = 0) => {
    const s = latin(font, t);
    const w = spacing ? L.spacedWidth(s, font, size, spacing) : font.widthOfTextAtSize(s, size);
    if (spacing) L.spaced(s, (W - w) / 2, y, font, size, color, spacing);
    else L.text(s, (W - w) / 2, y, font, size, color);
  };
  center("LEARN HIEROGLYPHICS · FOR TEACHERS", L.f.display, 9, C.gold, 2);
  y -= 50;
  center("Ancient Egypt", L.f.display, 40, C.ink);
  y -= 46;
  center("Writing Unit", L.f.display, 40, C.ink);
  y -= 36;
  center("Five ready-to-teach lessons on hieroglyphs", L.f.italic, 14, C.muted);
  y -= 20;
  center("KS2 (ages 7-11)  ·  US grades 4-7", L.f.body, 11, C.muted);

  // The pack's name in a cartouche: "SCRIBE" by the translator's rules.
  const glyphs = nameGlyphs("Scribe");
  const gs = 44;
  const gw = L.glyphWidth(glyphs, gs) + 8 * ([...glyphs].length - 1);
  const cw = gw + 70;
  const ch = 82;
  const cx = (W - cw) / 2 - 4;
  const cy = y - 60 - ch;
  cartoucheShape(L, cx, cy, cw, ch, 2.2);
  let gx = cx + 35;
  for (const g of glyphs) {
    L.text(g, gx, cy + ch / 2 - gs * 0.36, L.f.glyph, gs, C.ink);
    gx += L.glyphWidth(g, gs) + 8;
  }
  y = cy - 22;
  center(`"Scribe" in hieroglyphs: ${nameLetters("Scribe")}`, L.f.italic, 10, C.muted);

  y -= 54;
  if (L.sample) {
    const label = "FREE SAMPLE: LESSON 1";
    const w = L.f.bold.widthOfTextAtSize(label, 12) + 40;
    L.page.drawRectangle({ x: (W - w) / 2, y: y - 9, width: w, height: 28, color: C.gold });
    center(label, L.f.bold, 12, C.white);
    y -= 44;
  }
  const items = L.sample
    ? ["Lesson 1 complete: teacher plan, pupil worksheet and answers", "How the five-lesson unit fits together", "What the full unit adds"]
    : [...UNIT_CONTENTS];
  const listW = Math.min(400, W - 160);
  const lx = (W - listW) / 2;
  for (const item of items) {
    L.page.drawCircle({ x: lx + 3, y: y + 3.5, size: 2, color: C.gold });
    const used = L.drawRich(item, lx + 14, y + 11, { size: 10.5 }, listW - 14);
    y -= used + 3;
  }
  y = 70;
  center("learnhieroglyphics.com/teachers", L.f.display, 10, C.goldDeep, 1);
}

function overview(L: Layout) {
  L.newPage("How to use this unit");
  heading(L, "How to use this unit", 18);
  L.para(
    "Five lessons of about 50 minutes take a class from 'what are hieroglyphs?' to reading real royal names and words. Each lesson has a teacher plan (objectives, timings, what to say, support and stretch) followed by the pupil worksheet. The answers, and the end-of-unit quiz, are at the back.",
  );
  L.para(
    "Every sign is a real hieroglyph from Gardiner's sign list, and the spelling rules are the conventions Egyptologists use for modern names. The facts follow the Learn Hieroglyphics course and its articles on the Rosetta Stone and royal cartouches.",
    { size: 10.5, color: C.muted },
  );
  tableBlock(L, {
    k: "table",
    head: ["", "Lesson", "Free site tool"],
    rows: LESSONS.map((l) => [String(l.n), `**${l.title}**  ${l.short}.`, l.tool.name]),
    widths: [0.06, 0.62, 0.32],
  });
  subheading(L, "Curriculum links");
  bullets(L, [
    "**England:** National Curriculum KS2 history, the achievements of the earliest civilizations, with Ancient Egypt as the depth study. Lessons 1 and 3 also build the KS2 aim of understanding how our knowledge of the past is constructed from sources.",
    "**United States:** grade 6 world history (Ancient Egypt), C3 Framework Dimension 2 History indicators D2.His.1, 3, 4, 10, 12 and 16 (grades 6-8), and Common Core literacy in history RH.6-8.4 and RH.6-8.7. Each lesson lists its own.",
  ]);
  subheading(L, "Before you start");
  bullets(L, [
    "Print the Lesson 2 alphabet chart once per pupil (or laminate a class set): Lessons 2 to 5 use it.",
    "The free site tools work on any whiteboard browser with no sign-in. The Classroom quiz in Lesson 5 is free for 7 days, then part of a Classroom licence.",
    "Hieroglyphs could be written in either direction. The signs on these sheets face left, so they read left to right: towards the faces.",
  ]);
  box(L, "Licence", LICENCE_LINE);
}

function teacherPlan(L: Layout, lesson: Lesson) {
  L.newPage(`Lesson ${lesson.n}  ·  Teacher's plan`);
  L.spaced(`LESSON ${lesson.n} OF 5`, L.left, L.y - 9, L.f.display, 9, C.gold, 1.6);
  L.y -= 18;
  for (const line of L.lines(lesson.title, { size: 20, font: L.f.display }, L.width)) {
    L.drawLine(line, L.left, L.y, { size: 20, font: L.f.display, color: C.ink });
    L.y -= 26;
  }
  L.para(`Big question: ${lesson.bigQuestion}`, { size: 11, font: L.f.italic, color: C.muted }, 0, 8);
  L.text(`About ${lesson.steps.reduce((s, x) => s + x.min, 0)} minutes`, L.left, L.y - 8, L.f.bold, 9, C.goldDeep);
  L.y -= 18;

  subheading(L, "Learning objectives");
  bullets(L, lesson.objectives);
  subheading(L, "Success criteria");
  bullets(L, lesson.successCriteria);
  subheading(L, "Curriculum links");
  bullets(L, [...lesson.england.map((e) => `**England:** ${e}`), ...lesson.us.map((u) => `**US:** ${u}`)], 9.5);
  subheading(L, "You will need");
  bullets(L, lesson.resources);
  box(L, `Free tool: ${lesson.tool.name}`, `${lesson.tool.url}\n${lesson.tool.use}`.replace("\n", "  ·  "));
  subheading(L, "Key vocabulary");
  tableBlock(L, { k: "table", rows: lesson.vocabulary.map(([t, d]) => [`**${t}**`, d]), widths: [0.26, 0.74] }, true);

  // The sequence starts a page of its own: the plan reads as "what and why" on one page, "how" on the next.
  L.newPage();
  subheading(L, `Lesson sequence (${lesson.steps.reduce((s, x) => s + x.min, 0)} minutes)`);
  let elapsed = 0;
  const bodySize = L.paper === "letter" ? 9 : 9.5;
  for (const step of lesson.steps) {
    const textW = L.width - 66;
    const sayText = (step.say ?? []).map((s) => `"${s}"`);
    // Keep a step on one page: its title, body and prompts together.
    const need =
      L.measure(step.title, { size: 10.5, font: L.f.bold }, textW) +
      L.measure(step.body, { size: bodySize }, textW) +
      sayText.reduce((h, s) => h + L.measure(s, { size: bodySize, font: L.f.italic }, textW - 22) + 1, 0) +
      12;
    L.ensure(Math.min(need, 320));
    const page = L.page;
    const top = L.y;
    L.page.drawRectangle({ x: L.left, y: top - 30, width: 54, height: 30, color: C.tint, borderColor: C.rule, borderWidth: 0.5 });
    const mins = `${step.min} min`;
    L.text(mins, L.left + (54 - L.f.bold.widthOfTextAtSize(mins, 10)) / 2, top - 13, L.f.bold, 10, C.goldDeep);
    const span = `${elapsed}-${elapsed + step.min}`;
    L.text(span, L.left + (54 - L.f.body.widthOfTextAtSize(span, 7.5)) / 2, top - 24, L.f.body, 7.5, C.muted);
    elapsed += step.min;
    L.y -= L.drawRich(step.title, L.left + 66, top, { size: 10.5, font: L.f.bold }, textW) + 1;
    L.para(step.body, { size: bodySize }, 66, 2);
    for (const s of sayText) {
      L.ensure(15);
      L.text("Say", L.left + 66, L.y - 9.5, L.f.bold, 7.5, C.gold);
      L.para(s, { size: bodySize, font: L.f.italic, color: C.muted }, 88, 1);
    }
    L.y = (L.page === page ? Math.min(L.y, top - 34) : L.y) - 7;
  }

  subheading(L, "Differentiation");
  bullets(L, [...lesson.support.map((s) => `**Support:** ${s}`), ...lesson.stretch.map((s) => `**Stretch:** ${s}`)]);
  box(L, "Exit ticket", lesson.exitTicket);
}

function worksheet(L: Layout, lesson: Lesson) {
  L.newPage(`Worksheet ${lesson.n}  ·  Pupil sheet`);
  L.spaced(`WORKSHEET ${lesson.n}`, L.left, L.y - 9, L.f.display, 9, C.gold, 1.6);
  L.y -= 16;
  L.text(latin(L.f.display, lesson.title), L.left, L.y - 16, L.f.display, lesson.title.length > 44 ? 14 : 16, C.ink);
  L.y -= 30;
  blocks(L, lesson.worksheet);
}

function quiz(L: Layout) {
  L.newPage("End-of-unit quiz  ·  Pupil sheet");
  L.spaced("END-OF-UNIT QUIZ", L.left, L.y - 9, L.f.display, 9, C.gold, 1.6);
  L.y -= 16;
  L.text("Ancient Egyptian writing", L.left, L.y - 16, L.f.display, 16, C.ink);
  L.y -= 30;
  L.para(`Name: ______________________    Class: __________    Score: ______ / ${QUIZ_MARKS}`);
  heading(L, "A. Choose the right answer (1 mark each)", 11);
  mcqBlock(L, QUIZ_A.map((q) => ({ q: q.q, options: q.options })));
  heading(L, "B. Read and write (you may use the alphabet chart)", 11);
  QUIZ_B.forEach((w, i) => {
    L.ensure(50);
    const n = QUIZ_A.length + i + 1;
    L.text(`${n}.`, L.left, L.y - 24, L.f.bold, 10, C.gold);
    L.text(w.glyphs, L.left + 22, L.y - 30, L.f.glyph, 28, C.ink);
    const x = L.left + 22 + L.glyphWidth(w.glyphs, 28) + 26;
    L.text("Sounds: ____________    Meaning: ________________   (2 marks)", x, L.y - 24, L.f.body, 10, C.ink);
    L.y -= 48;
  });
  const n = QUIZ_A.length + QUIZ_B.length + 1;
  L.ensure(100);
  L.text(`${n}.`, L.left, L.y - 11, L.f.bold, 10, C.gold);
  L.drawRich(`Write the name **${QUIZ_WRITE_NAME.toUpperCase()}** in hieroglyphs, in a cartouche. (2 marks)`, L.left + 18, L.y, { size: 10 }, L.width - 18);
  L.y -= 16;
  cartoucheBlock(L, undefined);
  heading(L, "C. Explain", 11);
  QUIZ_C.forEach((q, i) => {
    L.ensure(100);
    const qn = n + 1 + i;
    L.text(`${qn}.`, L.left, L.y - 11, L.f.bold, 10, C.gold);
    L.y -= L.drawRich(q.q, L.left + 18, L.y, { size: 10 }, L.width - 18);
    writingLines(L, 3, 22);
  });
}

function answerKey(L: Layout, lessons: Lesson[], withQuiz: boolean) {
  L.newPage("Answer key  ·  Teacher");
  heading(L, "Answer key", 18);
  for (const lesson of lessons) blocks(L, lesson.answers);
  if (!withQuiz) return;
  heading(L, `End-of-unit quiz (${QUIZ_MARKS} marks)`, 12);
  const letters = ["a", "b", "c"];
  L.para(`**Section A.** ${QUIZ_A.map((q, i) => `${i + 1} ${letters[q.answer]}) ${q.options[q.answer]}`).join(".  ")}.`);
  QUIZ_B.forEach((w, i) => L.para(`**${QUIZ_A.length + i + 1}.** ${w.glyphs}  ${w.answer}`));
  const n = QUIZ_A.length + QUIZ_B.length + 1;
  L.para(
    `**${n}.** ${nameGlyphs(QUIZ_WRITE_NAME)}: ${nameKey(QUIZ_WRITE_NAME)}. 1 mark for the right signs in order, 1 for the cartouche.`,
  );
  QUIZ_C.forEach((q, i) => L.para(`**${n + 1 + i}.** ${q.answer}`));
  box(
    L,
    "Keep going with your class",
    "Name translator: learnhieroglyphics.com/translate-name-to-hieroglyphics  ·  Hieroglyphics keyboard: learnhieroglyphics.com/hieroglyphics-keyboard  ·  Classroom quiz: learnhieroglyphics.com/teachers/class  ·  The full course for a class, with every pupil's progress on one page: learnhieroglyphics.com/pricing#teachers",
  );
}

function sampleEnd(L: Layout) {
  L.newPage("The full unit");
  heading(L, "The full unit: five lessons", 18);
  L.para("You have Lesson 1. The full Ancient Egypt Writing Unit carries the class on to writing their own names, reading real cartouches and words, and a final assessment.");
  tableBlock(L, {
    k: "table",
    head: ["", "Lesson"],
    rows: LESSONS.map((l) => [String(l.n), `**${l.title}**  ${l.short}.`]),
    widths: [0.06, 0.94],
  });
  bullets(L, [...UNIT_CONTENTS]);
  box(L, "Get the whole unit", `One PDF, A4 or US Letter, yours to keep: learnhieroglyphics.com/teachers/unit-pack`);
}

/* ── Entry point ──────────────────────────────────────────────────────── */

export type UnitPackPdfOptions = { paper?: Paper; sample?: boolean };

export async function buildUnitPackPdf({ paper = "a4", sample = false }: UnitPackPdfOptions = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(sample ? `${UNIT_PACK.name}: free sample (Lesson 1)` : UNIT_PACK.name);
  doc.setAuthor("Learn Hieroglyphics");
  doc.setSubject("Five lessons on Egyptian hieroglyphs for KS2 and grade 6: plans, worksheets, quiz and answers");
  doc.setKeywords(["Ancient Egypt", "hieroglyphs", "KS2 history", "grade 6 world history", "Rosetta Stone", "cartouche"]);
  doc.setProducer("learnhieroglyphics.com");
  doc.setCreator("learnhieroglyphics.com");
  doc.setCreationDate(new Date());

  const fonts: Fonts = {
    glyph: await doc.embedFont(b64(UNIT_GLYPH_FONT), { subset: true }),
    display: await doc.embedFont(b64(UNIT_DISPLAY_FONT), { subset: true }),
    body: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };
  const L = new Layout(doc, fonts, paper, sample);

  cover(L);
  overview(L);
  const lessons = sample ? LESSONS.slice(0, 1) : LESSONS;
  for (const lesson of lessons) {
    teacherPlan(L, lesson);
    worksheet(L, lesson);
  }
  if (!sample) quiz(L);
  answerKey(L, lessons, !sample);
  if (sample) sampleEnd(L);

  return doc.save();
}
