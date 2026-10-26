/**
 * The Cartouche Print: a paid, print-ready A4 PDF of one name in a
 * cartouche, sold from the translator without an account. This file is the
 * shared, dependency-free part (client and server); the PDF itself is built
 * in cartouche-print-pdf.ts (server only).
 *
 * Money: one Stripe Checkout Session in payment mode. The Price comes from
 * STRIPE_PRICE_CARTOUCHE (scripts/stripe-create-plans.mjs creates it, USD
 * with a GBP currency option); without it the checkout route falls back to
 * an inline price so a fresh environment still works.
 */
import type { Currency } from "@/lib/pricing";
import { normaliseShareName } from "@/lib/share";
import type { SeasonId } from "@/lib/keyboard-card";

export const CARTOUCHE_PRINT = {
  /** Travels in Checkout Session metadata.product; the webhook keys on it. */
  id: "cartouche-print",
  name: "Cartouche Print",
  description: "A print-ready A4 PDF of one name in a cartouche, with a sign-by-sign key and the story of the cartouche.",
  usd: 19.99,
  gbp: 15.99,
  envKey: "STRIPE_PRICE_CARTOUCHE",
} as const;

/** The thank-you / download page. Takes ?session_id=cs_… */
export const CARTOUCHE_PRINT_PATH = "/cartouche-print";
export const CARTOUCHE_PRINT_DOWNLOAD_PATH = "/api/cartouche-print/download";

export function cartouchePrintAmount(currency: Currency): number {
  return currency === "GBP" ? CARTOUCHE_PRINT.gbp : CARTOUCHE_PRINT.usd;
}

/** Minor units for Stripe (499, 399). */
export function cartouchePrintMinor(currency: Currency): number {
  return Math.round(cartouchePrintAmount(currency) * 100);
}

export function formatCartouchePrintPrice(currency: Currency): string {
  return `${currency === "GBP" ? "£" : "$"}${cartouchePrintAmount(currency).toFixed(2)}`;
}

/** e.g. "harry-cartouche-print.pdf" */
export function cartouchePrintFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "my"}-cartouche-print.pdf`;
}

export function cartouchePrintDownloadPath(sessionId: string): string {
  return `${CARTOUCHE_PRINT_DOWNLOAD_PATH}?session_id=${encodeURIComponent(sessionId)}`;
}

/** Stripe Checkout Session ids look like cs_test_… / cs_live_…; nothing else is worth a round trip. */
export function looksLikeCheckoutSessionId(id: unknown): id is string {
  return typeof id === "string" && /^cs_[A-Za-z0-9_]{8,200}$/.test(id);
}

type SessionLike = {
  payment_status?: string | null;
  metadata?: Record<string, string> | null;
};

/** Is this a Cartouche Print order, whatever its payment state? */
export function isCartouchePrintSession(session: SessionLike): boolean {
  return session.metadata?.product === CARTOUCHE_PRINT.id;
}

/** A Cartouche Print order that has actually been paid for (the only state we deliver a PDF in). */
export function isPaidCartouchePrintSession(session: SessionLike): boolean {
  return isCartouchePrintSession(session) && session.payment_status === "paid";
}

/** The name the buyer ordered, as stored in the session metadata. */
export function cartouchePrintName(session: SessionLike): string | null {
  const name = session.metadata?.name?.trim();
  return name ? name : null;
}

/* ---------------------------------------------------------------------- *
 * Family prints: up to four names on one page, each in its own cartouche,
 * stacked. metadata.name stays the first name (old readers, the owner email);
 * metadata.names carries the whole list, "|"-joined, only when there are two
 * or more, so a one-name order's metadata is exactly what it always was.
 * ---------------------------------------------------------------------- */

export const CARTOUCHE_FAMILY = {
  /** Names on one page, the first included. */
  maxNames: 4,
  /** Added to a posted or framed print with two or more names (same Prodigi SKU, so same cost). */
  surchargeUsd: 5,
  surchargeGbp: 4,
} as const;

const NAMES_SEPARATOR = "|";
/** Stripe's limit on one metadata value. */
const METADATA_VALUE_MAX = 500;

/**
 * Clean a list of names: each through normaliseShareName (a "|" cannot
 * survive it), blanks and invalid ones dropped, repeats (ignoring case)
 * dropped, at most four.
 */
export function cleanCartoucheNames(raw: readonly unknown[]): string[] {
  const out: string[] = [];
  for (const r of raw) {
    const n = normaliseShareName(typeof r === "string" ? r : null);
    if (!n || out.some((o) => o.toLowerCase() === n.toLowerCase())) continue;
    out.push(n);
    if (out.length === CARTOUCHE_FAMILY.maxNames) break;
  }
  return out;
}

/** metadata.names for a family order; undefined for one name, so a one-name order's metadata is unchanged. */
export function encodeCartoucheNames(names: readonly string[]): string | undefined {
  if (names.length < 2) return undefined;
  const v = names.join(NAMES_SEPARATOR);
  return v.length <= METADATA_VALUE_MAX ? v : undefined;
}

/**
 * Every name on the order, first name first. Orders from before family prints
 * (and one-name orders) have only metadata.name; a names value that does not
 * parse to two or more good names falls back to it.
 */
export function cartouchePrintNames(session: SessionLike): string[] {
  const first = cartouchePrintName(session);
  const raw = session.metadata?.names;
  if (raw) {
    const names = cleanCartoucheNames(raw.split(NAMES_SEPARATOR));
    if (names.length >= 2) return names;
  }
  return first ? [first] : [];
}

/**
 * What the file builders take for this order: the name string for one name
 * (the exact call every one-name order has always made), the list for a
 * family. Null when the session has no name.
 */
export function cartouchePrintSubject(session: SessionLike): string | string[] | null {
  const names = cartouchePrintNames(session);
  if (names.length === 0) return null;
  return names.length === 1 ? names[0] : names;
}

/** "Harry", "Harry and Sally", "Harry, Sally and Tom". */
export function joinCartoucheNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** The family surcharge in major units: posted and framed prints with two or more names only. */
export function cartoucheFamilySurcharge(currency: Currency, format: CartouchePrintFormatId, nameCount: number): number {
  if (nameCount < 2 || !cartouchePrintFormatById(format).physical) return 0;
  return currency === "GBP" ? CARTOUCHE_FAMILY.surchargeGbp : CARTOUCHE_FAMILY.surchargeUsd;
}

/** What the order costs: the format's price plus the family surcharge where it applies. */
export function cartouchePrintOrderAmount(currency: Currency, format: CartouchePrintFormatId, nameCount = 1): number {
  const total = cartouchePrintFormatAmount(currency, format) + cartoucheFamilySurcharge(currency, format, nameCount);
  return Math.round(total * 100) / 100;
}

export function cartouchePrintOrderMinor(currency: Currency, format: CartouchePrintFormatId, nameCount = 1): number {
  return Math.round(cartouchePrintOrderAmount(currency, format, nameCount) * 100);
}

export function formatCartouchePrintOrderPrice(currency: Currency, format: CartouchePrintFormatId, nameCount = 1): string {
  return `${currency === "GBP" ? "£" : "$"}${cartouchePrintOrderAmount(currency, format, nameCount).toFixed(2)}`;
}

/** The cheapest of `formats`, for "from $3.99". */
export function cartouchePrintFromPrice(currency: Currency, formats: readonly CartouchePrintFormatId[]): string {
  const cheapest = Math.min(...formats.map((f) => cartouchePrintFormatAmount(currency, f)));
  return `${currency === "GBP" ? "£" : "$"}${cheapest.toFixed(2)}`;
}

/* ---------------------------------------------------------------------- *
 * Christmas: when to stop promising a posted print by the 25th. The cutoffs
 * are conservative for international standard shipping (a frame takes
 * longer to make). Months are 1-based.
 * ---------------------------------------------------------------------- */

export const CARTOUCHE_CHRISTMAS = {
  /** The notice starts on 1 November. */
  start: { month: 11, day: 1 },
  /** Last day to order for Christmas delivery, by posted format. */
  cutoff: { print: { month: 12, day: 10 }, framed: { month: 12, day: 8 } },
  christmas: { month: 12, day: 25 },
} as const;

export type ChristmasNotice = { kind: "order-by"; date: string; text: string } | { kind: "late"; text: string } | null;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * The Christmas line for a format on a given day (the visitor's own
 * calendar): "Order by 10 December for Christmas delivery" from 1 November to
 * the cutoff, inclusive; the late notice from the day after it to Christmas
 * Eve; nothing otherwise, and nothing for a format that is not posted.
 */
export function christmasNotice(formatId: CartouchePrintFormatId, now: Date): ChristmasNotice {
  if (!cartouchePrintFormatById(formatId).physical) return null;
  // every unframed size ships like the A4 print
  const format = formatId === "framed" ? "framed" : "print";
  const key = (d: { month: number; day: number }) => d.month * 100 + d.day;
  const today = key({ month: now.getMonth() + 1, day: now.getDate() });
  const { start, cutoff, christmas } = CARTOUCHE_CHRISTMAS;
  if (today < key(start) || today >= key(christmas)) return null;
  const c = cutoff[format];
  if (today <= key(c)) {
    const date = `${c.day} ${MONTHS[c.month - 1]}`;
    return { kind: "order-by", date, text: `Order by ${date} for Christmas delivery` };
  }
  return { kind: "late", text: "Posted prints may arrive after Christmas — the HD image arrives in a minute" };
}

/* ---------------------------------------------------------------------- *
 * Themes: the paper the print is set on. A short named palette rather than
 * a free colour picker, so every choice prints well and still looks like
 * the site. The id travels in Checkout Session metadata.theme; the PDF
 * builder and the on-page preview both read their colours from here.
 * ---------------------------------------------------------------------- */

export type CartouchePrintThemeId = "cream" | "abusimbel" | "valentine" | "mother" | "father" | "halloween" | "newyear" | "christmas" | "pyramids" | "stars" | "nile" | "treasure" | "karnak" | "papyrus" | "night" | "temple" | "lotus";

export type CartouchePrintTheme = {
  id: CartouchePrintThemeId;
  label: string;
  /** One line under the swatch. */
  blurb: string;
  /**
   * Full-page artwork behind page one (public path, A4 proportions, JPEG) and
   * its thumbnail for the swatch. Cream has none: it is the plain, ink-friendly
   * page. Art pages carry their own border, so the drawn frame is skipped.
   */
  art?: string;
  thumb?: string;
  /** How far up from the page foot the footer sits, clear of the art's border (points). */
  footerInset: number;
  /** Hex colours: the page (behind the art, and pages two and three), the rope and rules, the darker gold for headings, the ink the signs are drawn in, the muted body text, the hairline rule. */
  page: string;
  gold: string;
  goldDeep: string;
  ink: string;
  muted: string;
  rule: string;
  /** Offered only in this event's window (src/lib/keyboard-card.ts SEASONS); old orders still print on it. */
  season?: SeasonId;
};

export const CARTOUCHE_PRINT_THEMES: readonly CartouchePrintTheme[] = [
  {
    id: "cream",
    label: "Cream",
    blurb: "Plain warm paper, dark ink. Prints well on any home printer.",
    footerInset: 40,
    page: "#F8F2E4",
    gold: "#B8922A",
    goldDeep: "#8A6E20",
    ink: "#2B2114",
    muted: "#6E6455",
    rule: "#D1BD8C",
  },
  // The keyboard's scenes as papers (scripts/dev/build-print-scene-art.mjs): same ids as its finishes, so the
  // name translator's one picker sets the picture and the print together.
  {
    id: "abusimbel",
    label: "Abu Simbel",
    blurb: "Ramesses II's great temple at Abu Simbel at sunrise. Unlocked by sending a friend their name.",
    art: "/cartouche-print/abusimbel.jpg",
    thumb: "/cartouche-print/thumbs/abusimbel.jpg",
    footerInset: 40,
    page: "#C98A4A",
    gold: "#3B1D06",
    goldDeep: "#3B1D06",
    ink: "#3B1D06",
    muted: "#4A2A0C",
    rule: "#7A4A1A",
  },
  // Seasonal papers (2026-10-19): the same event scenes as the picture's backgrounds (keyboard-card.ts SEASONS).
  {
    id: "valentine",
    label: "Valentine's",
    blurb: "The pyramids at dusk, lotus flowers and rose petals on the water.",
    art: "/cartouche-print/valentine.jpg",
    thumb: "/cartouche-print/thumbs/valentine.jpg",
    footerInset: 40,
    page: "#D9789A",
    gold: "#FFEFE4",
    goldDeep: "#FFF5EA",
    ink: "#FFF5EA",
    muted: "#FFEBDD",
    rule: "#F7C9D6",
    season: "valentine",
  },
  {
    id: "mother",
    label: "Mother's Day",
    blurb: "A spring garden of blue lotus and papyrus by the temple of Hathor.",
    art: "/cartouche-print/mother.jpg",
    thumb: "/cartouche-print/thumbs/mother.jpg",
    footerInset: 40,
    page: "#9CC4E4",
    gold: "#1C3566",
    goldDeep: "#1C3566",
    ink: "#1C3566",
    muted: "#22406E",
    rule: "#5A7AA8",
    season: "mother",
  },
  {
    id: "father",
    label: "Father's Day",
    blurb: "The Colossi of Memnon under a golden sky.",
    art: "/cartouche-print/father.jpg",
    thumb: "/cartouche-print/thumbs/father.jpg",
    footerInset: 40,
    page: "#E89A2E",
    gold: "#2A1205",
    goldDeep: "#2A1205",
    ink: "#2A1205",
    muted: "#3A1A08",
    rule: "#7A4A18",
    season: "father",
  },
  {
    id: "halloween",
    label: "Halloween",
    blurb: "A harvest moon over the pyramids, torches at a tomb door.",
    art: "/cartouche-print/halloween.jpg",
    thumb: "/cartouche-print/thumbs/halloween.jpg",
    footerInset: 40,
    page: "#1A1030",
    gold: "#FFB347",
    goldDeep: "#FFB347",
    ink: "#FFC36B",
    muted: "#F3D9B0",
    rule: "#6B5A80",
    season: "halloween",
  },
  {
    id: "newyear",
    label: "New Year",
    blurb: "Fireworks over Giza at midnight.",
    art: "/cartouche-print/newyear.jpg",
    thumb: "/cartouche-print/thumbs/newyear.jpg",
    footerInset: 40,
    page: "#0B1330",
    gold: "#E9C25E",
    goldDeep: "#F4D27A",
    ink: "#F6D27A",
    muted: "#E6DABA",
    rule: "#6B6A80",
    season: "newyear",
  },
  {
    id: "christmas",
    label: "Christmas",
    blurb: "A Christmas star over the pyramids, inside a garland of holly and gold.",
    art: "/cartouche-print/christmas.jpg",
    thumb: "/cartouche-print/thumbs/christmas.jpg",
    footerInset: 40,
    page: "#0A1430",
    gold: "#E9C25E",
    goldDeep: "#F4D27A",
    ink: "#FFF1CC",
    muted: "#E3D6B4",
    rule: "#6B6A80",
    season: "christmas",
  },
  {
    id: "pyramids",
    label: "Pyramids",
    blurb: "The pyramids of Giza at sunset, the name across the evening sky.",
    art: "/cartouche-print/pyramids.jpg",
    thumb: "/cartouche-print/thumbs/pyramids.jpg",
    footerInset: 40,
    page: "#C9672E",
    gold: "#FFEFC8",
    goldDeep: "#FFF3D6",
    ink: "#FFF3D6",
    muted: "#FFE7C4",
    rule: "#F7D9A8",
  },
  {
    id: "stars",
    label: "Starlight",
    blurb: "Gold among the stars, over the pyramids and the Sphinx by night.",
    art: "/cartouche-print/stars.jpg",
    thumb: "/cartouche-print/thumbs/stars.jpg",
    footerInset: 40,
    page: "#0B1330",
    gold: "#E9C25E",
    goldDeep: "#F2D27A",
    ink: "#F6D78A",
    muted: "#D9CDAA",
    rule: "#6B6A80",
  },
  {
    id: "nile",
    label: "Nile",
    blurb: "A felucca on the Nile at sunset, the name dark as the palms.",
    art: "/cartouche-print/nile.jpg",
    thumb: "/cartouche-print/thumbs/nile.jpg",
    footerInset: 40,
    page: "#E8822E",
    gold: "#2A1205",
    goldDeep: "#2A1205",
    ink: "#2A1205",
    muted: "#3A1A08",
    rule: "#7A3A10",
  },
  {
    id: "treasure",
    label: "Gold",
    blurb: "Gold on black inside a jewelled frame of lapis, carnelian and turquoise.",
    art: "/cartouche-print/treasure.jpg",
    thumb: "/cartouche-print/thumbs/treasure.jpg",
    footerInset: 52,
    page: "#0E0D0C",
    gold: "#D9B451",
    goldDeep: "#EBC664",
    ink: "#F0D27E",
    muted: "#CDB98C",
    rule: "#5A4A2A",
  },
  {
    id: "karnak",
    label: "Karnak",
    blurb: "Carved on the wall of Karnak's great hall, between its columns, in the morning light.",
    art: "/cartouche-print/karnak.jpg",
    thumb: "/cartouche-print/thumbs/karnak.jpg",
    footerInset: 40,
    page: "#B98A52",
    gold: "#4A2A0C",
    goldDeep: "#4A2A0C",
    ink: "#3A2208",
    muted: "#4A2E12",
    rule: "#9C7434",
  },
  {
    id: "papyrus",
    label: "Papyrus",
    blurb: "A sheet of aged papyrus, fibres and worn edges, the name in dark ink.",
    art: "/cartouche-print/papyrus.jpg",
    thumb: "/cartouche-print/thumbs/papyrus.jpg",
    footerInset: 44,
    page: "#CF9246",
    gold: "#4A2E10",
    goldDeep: "#3B2410",
    ink: "#26170A",
    muted: "#4A3418",
    rule: "#9C7434",
  },
  {
    id: "night",
    label: "Night",
    blurb: "A tomb ceiling: gold stars on deep blue, with a lotus border. Best from a print shop.",
    art: "/cartouche-print/night.jpg",
    thumb: "/cartouche-print/thumbs/night.jpg",
    footerInset: 76,
    page: "#0F1F4A",
    gold: "#D4AF37",
    goldDeep: "#E4C766",
    ink: "#F1E6C8",
    muted: "#C9BE9E",
    rule: "#4B5878",
  },
  {
    id: "temple",
    label: "Temple",
    blurb: "Carved into a sandstone wall under the winged sun, as at Karnak.",
    art: "/cartouche-print/temple.jpg",
    thumb: "/cartouche-print/thumbs/temple.jpg",
    footerInset: 160,
    page: "#C48643",
    gold: "#5A3812",
    goldDeep: "#4A2E10",
    ink: "#3A2208",
    muted: "#5A3E1C",
    rule: "#9C7434",
  },
  {
    id: "lotus",
    label: "Lotus",
    blurb: "Painted plaster with a lapis, turquoise and terracotta lotus border.",
    art: "/cartouche-print/lotus.jpg",
    thumb: "/cartouche-print/thumbs/lotus.jpg",
    footerInset: 82,
    page: "#EADCC0",
    gold: "#1F4E9C",
    goldDeep: "#8A6E20",
    ink: "#2B2114",
    muted: "#6E6455",
    rule: "#C4A96E",
  },
] as const;

export const DEFAULT_CARTOUCHE_PRINT_THEME: CartouchePrintThemeId = "cream";

export function isCartouchePrintTheme(id: unknown): id is CartouchePrintThemeId {
  return typeof id === "string" && CARTOUCHE_PRINT_THEMES.some((t) => t.id === id);
}

export function cartouchePrintThemeById(id: CartouchePrintThemeId): CartouchePrintTheme {
  return CARTOUCHE_PRINT_THEMES.find((t) => t.id === id) ?? CARTOUCHE_PRINT_THEMES[0];
}

/** The theme the buyer chose, from the session metadata; cream for orders placed before themes existed. */
export function cartouchePrintTheme(session: SessionLike): CartouchePrintThemeId {
  const id = session.metadata?.theme;
  return isCartouchePrintTheme(id) ? id : DEFAULT_CARTOUCHE_PRINT_THEME;
}

/* ---------------------------------------------------------------------- *
 * Page one, as points on A4: the preview SVG (CartouchePrintPreview), the
 * share PNG (/cartouche-image?paper=) and the PDF all place the cartouche
 * the same way. The glyph run is sized by an estimate here (Noto Egyptian
 * advances average about 0.8 em); the PDF measures the real font.
 * ---------------------------------------------------------------------- */

export const PRINT_PAGE = { width: 595.28, height: 841.89, margin: 54 } as const;

const GLYPH_ADVANCE = 0.8;

export function printPageLayout(signCount: number) {
  const { width: W, height: H, margin: MARGIN } = PRINT_PAGE;
  const maxLoopW = W - 2 * MARGIN - 40;
  let size = 110;
  const runW = (s: number) => signCount * s * GLYPH_ADVANCE;
  const padX = (s: number) => s * 0.55;
  while (runW(size) + 2 * padX(size) > maxLoopW && size > 24) size -= 2;
  const loopH = Math.max(size * 1.55, 120);
  const loopW = Math.max(Math.min(runW(size) + 2 * padX(size), maxLoopW), loopH * 1.6);
  const loopX = (W - loopW - 30) / 2;
  // The PDF's y runs up from the bottom; SVG's runs down from the top.
  const loopTop = H - (H * 0.5 - loopH / 2 + 40) - loopH;
  return { size, loopH, loopW, loopX, loopTop };
}

/** The rope loop of a cartouche as an SVG path: a rectangle with full-radius ends. */
export function cartoucheLoopPath(x: number, y: number, w: number, h: number): string {
  const r = h / 2;
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}

/** Points for the name on page one: shrinks with the name so it stays inside the margins. */
export function printNameSize(name: string): number {
  const { width: W, margin: MARGIN } = PRINT_PAGE;
  return Math.max(16, Math.min(36, (W - 2 * MARGIN) / (Math.max(name.length, 1) * 0.9)));
}

/**
 * Page one with two to four names: a kicker, then each name's cartouche
 * stacked with its name under it, then the caption. y runs down from the top
 * of the page (SVG / satori); the PDF flips it. The band stays clear of every
 * paper's artwork (the temple's winged sun above, its lotus frieze below).
 *
 * `measure(i, size)` gives the width of name i's glyph run at `size` points;
 * the PDF passes the real font's, the preview and the image use the estimate.
 */
export const FAMILY_BAND = { kicker: 158, top: 186, bottom: 600, caption: 624, captionSub: 640 } as const;

/**
 * Advance widths (em) of every sign in the translator's subset font
 * (src/app/cartouche-image/noto-egyptian-translator.ttf), measured with
 * fontkit. The family layout sizes each loop from these: a sign-count guess
 * spills on wide signs (the hand in "Dad" is 1.57 em). Unknown signs count 1 em.
 */
const SIGN_ADVANCE_EM: Record<number, number> = {
  0x13153: 1.12, 0x13171: 0.86, 0x13191: 1.5, 0x13193: 1.07, 0x13216: 1.2, 0x13219: 1.31, 0x13254: 1.12,
  0x1308b: 1.18, 0x130a7: 1.57, 0x130c0: 0.9, 0x1313f: 0.99, 0x131cb: 0.34, 0x1320e: 0.72, 0x132aa: 0.4,
  0x132f4: 0.42, 0x133a1: 1.08, 0x133bc: 0.6, 0x133cf: 0.63, 0x1340d: 0.68, 0x133ff: 0.43, 0x13283: 1.36,
};

/** Width of a run of signs in em, from the measured table. */
export function glyphRunEm(glyphs: string): number {
  let em = 0;
  for (const ch of glyphs) em += SIGN_ADVANCE_EM[ch.codePointAt(0)!] ?? 1;
  return Math.max(em, 1);
}

/** `glyphRuns` are each name's signs (getHieroglyphs); `measure` overrides the table with real font metrics. */
export function familyPageLayout(glyphRuns: readonly string[], measure?: (i: number, size: number) => number) {
  const { width: W, margin: MARGIN } = PRINT_PAGE;
  const n = Math.max(glyphRuns.length, 1);
  const slotH = (FAMILY_BAND.bottom - FAMILY_BAND.top) / n;
  const nameMax = Math.min(24, Math.max(14, slotH * 0.14));
  const nameGap = nameMax + 10; // loop foot to the name's baseline
  const slotPad = 16; // under the name, before the next loop
  const loopH = Math.min(150, slotH - nameGap - slotPad);
  const maxLoopW = W - 2 * MARGIN - 40;
  const runW = measure ?? ((i: number, s: number) => glyphRunEm(glyphRuns[i] ?? "") * s);
  const padX = (s: number) => s * 0.55;
  const slots = glyphRuns.map((_, i) => {
    let size = Math.min(110, loopH / 1.55);
    while (runW(i, size) + 2 * padX(size) > maxLoopW && size > 14) size -= 1;
    const loopW = Math.max(Math.min(runW(i, size) + 2 * padX(size), maxLoopW), loopH * 1.6);
    const loopX = (W - loopW - 30) / 2;
    const loopTop = FAMILY_BAND.top + i * slotH;
    return { size, loopH, loopW, loopX, loopTop, nameBaseline: loopTop + loopH + nameGap };
  });
  return { slots, nameMax, slotH };
}

/** Points for a name under a family cartouche: capped at `max`, shrinking to fit the margins. */
export function familyNameSize(name: string, max: number): number {
  const { width: W, margin: MARGIN } = PRINT_PAGE;
  return Math.max(11, Math.min(max, (W - 2 * MARGIN) / (Math.max(name.length, 1) * 0.9)));
}

/**
 * The share image: page one on the chosen paper as a JPEG
 * (src/app/cartouche-image/print/route.tsx), 1240 × 1754.
 */
export function cartouchePrintImagePath(name: string | readonly string[], theme: CartouchePrintThemeId): string {
  // One name keeps the old URL exactly (the CDN holds those); a family repeats name=.
  const names = typeof name === "string" ? [name] : name;
  const q = names.map((n) => `name=${encodeURIComponent(n.trim())}`).join("&");
  return `/cartouche-image/print?${q}&paper=${encodeURIComponent(theme)}`;
}

/** File name for a saved or shared share image, e.g. "harry-cartouche-night.jpg". */
export function cartouchePrintImageFilename(name: string, theme: CartouchePrintThemeId): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${slug || "my"}-cartouche-${theme}.jpg`;
}

/* ---------------------------------------------------------------------- *
 * Formats: what the buyer receives. The digital PDF always comes with the
 * physical ones; the physical ones are printed and posted by Prodigi
 * (src/lib/prodigi.ts) from the same page-one PDF. The HD image is the cheap
 * way in: page one alone as a 300 dpi JPEG without the site's address, no
 * PDF. The id travels in Checkout Session metadata.format.
 * ---------------------------------------------------------------------- */

export type CartouchePrintFormatId = "digital" | "print" | "print-a3" | "print-a2" | "print-a1" | "framed" | "image";

export type CartouchePrintSize = "A4" | "A3" | "A2" | "A1";

export type CartouchePrintFormat = {
  id: CartouchePrintFormatId;
  /** Shown on the picker and the button. */
  label: string;
  /** The paper size of a physical format. */
  size?: CartouchePrintSize;
  /** Prodigi's SKU for the unframed sizes (src/lib/prodigi.ts; the A4 print and the frame keep their env overrides). */
  prodigiSku?: string;
  /** One line under the label. */
  blurb: string;
  usd: number;
  gbp: number;
  /** The Stripe Price id env var (scripts/stripe-create-plans.mjs creates the Price). */
  envKey: string;
  /** The products' metadata.plan id in Stripe, as the plan script writes it. */
  stripeProductId: string;
  physical: boolean;
  /** What is emailed and downloadable: the three-page PDF, or page one as an HD JPEG. */
  file: "pdf" | "jpeg";
  /** Delivery estimate for the copy, physical only. */
  shipsIn?: string;
};

export const CARTOUCHE_PRINT_FORMATS: readonly CartouchePrintFormat[] = [
  {
    id: "digital",
    label: "Digital PDF",
    blurb: "Print it yourself. Three A4 pages, in your inbox within a minute.",
    usd: 19.99,
    gbp: 15.99,
    envKey: "STRIPE_PRICE_CARTOUCHE",
    stripeProductId: "cartouche-print",
    physical: false,
    file: "pdf",
  },
  {
    id: "print",
    label: "A4 print, posted",
    blurb: "Giclée on 200 gsm fine-art paper, printed and posted to you. The PDF comes too.",
    // $39.99 from 2026-10-19 (was $34.99): US and Canadian postage left about £5–7 (Stripe Price price_1USJKK…)
    usd: 39.99,
    gbp: 27.99,
    envKey: "STRIPE_PRICE_CARTOUCHE_PRINT",
    stripeProductId: "cartouche-print-a4",
    size: "A4",
    prodigiSku: "GLOBAL-FAP-A4",
    physical: true,
    file: "pdf",
    shipsIn: "5 to 10 days",
  },
  // The bigger posters (2026-10-19): the same giclée paper from Prodigi (GLOBAL-FAP-A3/A2/A1). Costs with postage,
  // UK / US: A3 £15.48 / £20.25, A2 £19.08 / £21.02, A1 £23.88 / £25.57. Printed from the upscaled scene art
  // (public/cartouche-print/large/) so the background holds up; the signs are vector at any size.
  {
    id: "print-a3",
    label: "A3 print, posted",
    blurb: "Giclée on 200 gsm fine-art paper, 29.7 × 42 cm, printed and posted to you. The PDF comes too.",
    usd: 44.99,
    gbp: 34.99,
    envKey: "STRIPE_PRICE_CARTOUCHE_PRINT_A3",
    stripeProductId: "cartouche-print-a3",
    size: "A3",
    prodigiSku: "GLOBAL-FAP-A3",
    physical: true,
    file: "pdf",
    shipsIn: "5 to 10 days",
  },
  {
    id: "print-a2",
    label: "A2 poster, posted",
    blurb: "Giclée on 200 gsm fine-art paper, 42 × 59.4 cm, printed and posted to you. The PDF comes too.",
    usd: 59.99,
    gbp: 44.99,
    envKey: "STRIPE_PRICE_CARTOUCHE_PRINT_A2",
    stripeProductId: "cartouche-print-a2",
    size: "A2",
    prodigiSku: "GLOBAL-FAP-A2",
    physical: true,
    file: "pdf",
    shipsIn: "5 to 10 days",
  },
  {
    id: "print-a1",
    label: "A1 poster, posted",
    blurb: "Giclée on 200 gsm fine-art paper, 59.4 × 84.1 cm, printed and posted to you. The PDF comes too.",
    usd: 74.99,
    gbp: 54.99,
    envKey: "STRIPE_PRICE_CARTOUCHE_PRINT_A1",
    stripeProductId: "cartouche-print-a1",
    size: "A1",
    prodigiSku: "GLOBAL-FAP-A1",
    physical: true,
    file: "pdf",
    shipsIn: "5 to 10 days",
  },
  {
    id: "framed",
    label: "Framed A4 print",
    blurb: "The print in a black wooden frame with a white mount, under shatterproof acrylic, ready to hang. The PDF comes too.",
    // $94.99 / £59.99 from 2026-10-19 (was $79.99 / £49.99): Prodigi's GLOBAL-CFPM-A4 costs £40–56 posted, which
    // left about £8 in the UK and £1 in Canada (Stripe Price price_1USJKJ…)
    usd: 94.99,
    gbp: 59.99,
    envKey: "STRIPE_PRICE_CARTOUCHE_FRAMED",
    stripeProductId: "cartouche-print-framed",
    size: "A4",
    physical: true,
    file: "pdf",
    shipsIn: "7 to 12 days",
  },
  {
    id: "image",
    label: "HD digital image",
    blurb: "Page one as a 300 dpi picture, without our web address. Print it, frame it, or set it as a wallpaper. In your inbox within a minute.",
    usd: 3.99,
    gbp: 2.99,
    // Not created in Stripe yet: without the env var the checkout sends an inline price.
    envKey: "STRIPE_PRICE_CARTOUCHE_IMAGE",
    stripeProductId: "cartouche-image-hd",
    physical: false,
    file: "jpeg",
  },
] as const;

export const DEFAULT_CARTOUCHE_PRINT_FORMAT: CartouchePrintFormatId = "print";

/** The unframed posted print in every size, smallest first: one row on the card with a size picker. */
export const CARTOUCHE_PRINT_SIZES: readonly CartouchePrintFormatId[] = ["print", "print-a3", "print-a2", "print-a1"];

export function isUnframedPrint(id: CartouchePrintFormatId): boolean {
  return CARTOUCHE_PRINT_SIZES.includes(id);
}

export function isCartouchePrintFormat(id: unknown): id is CartouchePrintFormatId {
  return typeof id === "string" && CARTOUCHE_PRINT_FORMATS.some((f) => f.id === id);
}

export function cartouchePrintFormatById(id: CartouchePrintFormatId): CartouchePrintFormat {
  return CARTOUCHE_PRINT_FORMATS.find((f) => f.id === id) ?? CARTOUCHE_PRINT_FORMATS[0];
}

/** The format the buyer chose; digital for orders placed before formats existed. */
export function cartouchePrintFormat(session: SessionLike): CartouchePrintFormatId {
  const id = session.metadata?.format;
  return isCartouchePrintFormat(id) ? id : "digital";
}

/** A paid order whose file is the HD image rather than the PDF. */
export function isCartoucheImageSession(session: SessionLike): boolean {
  return cartouchePrintFormatById(cartouchePrintFormat(session)).file === "jpeg";
}

export const CARTOUCHE_PRINT_IMAGE_DOWNLOAD_PATH = "/api/cartouche-print/image";

export function cartoucheImageDownloadPath(sessionId: string): string {
  return `${CARTOUCHE_PRINT_IMAGE_DOWNLOAD_PATH}?session_id=${encodeURIComponent(sessionId)}`;
}

/** e.g. "harry-cartouche-papyrus-hd.jpg" */
export function cartoucheHdImageFilename(name: string, theme: CartouchePrintThemeId): string {
  return cartouchePrintImageFilename(name, theme).replace(/\.jpg$/, "-hd.jpg");
}

export function isPhysicalCartouchePrint(session: SessionLike): boolean {
  return cartouchePrintFormatById(cartouchePrintFormat(session)).physical;
}

export function cartouchePrintFormatAmount(currency: Currency, format: CartouchePrintFormatId): number {
  const f = cartouchePrintFormatById(format);
  return currency === "GBP" ? f.gbp : f.usd;
}

export function cartouchePrintFormatMinor(currency: Currency, format: CartouchePrintFormatId): number {
  return Math.round(cartouchePrintFormatAmount(currency, format) * 100);
}

export function formatCartouchePrintFormatPrice(currency: Currency, format: CartouchePrintFormatId): string {
  return `${currency === "GBP" ? "£" : "$"}${cartouchePrintFormatAmount(currency, format).toFixed(2)}`;
}

/**
 * Where a physical print can be posted. Prodigi prints locally in the UK,
 * EU, US, Australia and more, so this is the set of countries the shipping
 * price is folded into; Stripe shows the picker limited to these.
 */
export const CARTOUCHE_PRINT_SHIP_TO = [
  "GB", "IE", "US", "CA", "AU", "NZ",
  "DE", "FR", "NL", "BE", "LU", "AT", "CH", "ES", "PT", "IT",
  "DK", "SE", "NO", "FI", "PL", "CZ",
] as const;
