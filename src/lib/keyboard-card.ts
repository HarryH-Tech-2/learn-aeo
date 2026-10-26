/**
 * The keyboard's card: what the visitor typed on the wall, laid out as a 1200 × 630 picture in one of
 * ten finishes (with the English letters under each sign if asked), optionally as a gift card. The name translator uses the same card for a name (spell
 * "name"): spelled by sound as the translator spells it (SH, CH, TH one sign) and set in a cartouche. Shared by the live wall (src/app/hieroglyphics-keyboard/
 * KeyboardTool.tsx), the image routes (src/lib/keyboard-image.tsx) and the secret-message page, so the
 * picture saved, emailed or bought is the one on screen. Dependency-free: client and server.
 *
 * Money: the plain finish saves free; the other four are kept by email (a lead) or bought in HD without
 * the site's address (keyboard-image checkout), and course members download the HD copy free.
 */
import { signForKey } from "@/lib/hieroglyph-keyboard";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { WORDS } from "@/lib/content/uniliteral-words";
import { normaliseShareName } from "@/lib/share";

/* ── Finishes ───────────────────────────────────────────────────────── */

export type KeyboardStyleId = "plain" | "stencil" | "stencil-tall" | "abusimbel" | "valentine" | "mother" | "father" | "halloween" | "newyear" | "christmas" | "pyramids" | "stars" | "nile" | "treasure" | "karnak" | "papyrus" | "night" | "temple" | "lotus";

type Shadow = { x: number; y: number; blur: number; color: string };

/* ── Seasons ────────────────────────────────────────────────────────── */

export type SeasonId = "valentine" | "mother" | "father" | "halloween" | "christmas" | "newyear";

/**
 * When each event's background and card are offered (1-based months, both days inclusive; New Year runs over the
 * turn of the year). Mother's Day spans the UK's Mothering Sunday in March and the US Mother's Day in May; Father's
 * Day is the third Sunday of June in both.
 */
export const SEASONS: Record<SeasonId, { from: [number, number]; to: [number, number] }> = {
  valentine: { from: [2, 1], to: [2, 14] },
  mother: { from: [3, 1], to: [5, 15] },
  father: { from: [6, 1], to: [6, 21] },
  halloween: { from: [10, 1], to: [10, 31] },
  christmas: { from: [11, 1], to: [12, 25] },
  newyear: { from: [12, 26], to: [1, 10] },
};

/** Is `season` on today (the visitor's own calendar)? */
export function inSeason(season: SeasonId, now: Date = new Date()): boolean {
  const { from, to } = SEASONS[season];
  const key = (m: number, d: number) => m * 100 + d;
  const today = key(now.getMonth() + 1, now.getDate());
  const a = key(...from);
  const b = key(...to);
  return a <= b ? today >= a && today <= b : today >= a || today <= b;
}

export type KeyboardStyle = {
  id: KeyboardStyleId;
  label: string;
  blurb: string;
  /** Landscape artwork (public path) at 2400 × 1260 and 1200 × 630, from scripts/dev/build-keyboard-style-art.mjs; none for plain. */
  art?: string;
  art1200?: string;
  thumb?: string;
  /** Where the writing goes, as fractions of the card, clear of the artwork's borders. */
  box: { x: number; y: number; w: number; h: number };
  /** Top of the site's address on the share picture (fraction of the height); under the box by default. */
  footerY?: number;
  /** Behind the art (and the whole card for plain). */
  page: string;
  /** Sign colours: one, or a painter's palette handed out sign by sign. */
  ink: string[];
  heading: string;
  caption: string;
  footer: string;
  /** Text shadows in em of the glyph size: carved relief, a gold glow. */
  shadow?: Shadow[];
  /** Thicken the outline signs into a brush or chisel line: half the added stroke width, in em (a text stroke in the sign's own ink). */
  bold?: number;
  /** Plain draws the site's double gold frame itself. */
  frame?: boolean;
  /** Lifts the heading, caption, letters and address off a busy scene (CSS text-shadow, px on the 1200-wide card). */
  lift?: string;
  /** A raised edge: a crisp shaded rim down and to the right of each sign, and/or a lit one up and to the left. */
  bevel?: { light?: string; dark?: string };
  /** Not offered in the pickers any more; still drawn for old links, emails and purchases. */
  hidden?: boolean;
  /** Offered only to someone who has sent a friend their name (src/lib/referral.ts); locked in the picker until then. */
  bonus?: boolean;
  /** A tall card (630 × 1200) with the signs in one column, top to bottom: the vertical tattoo stencil. */
  portrait?: boolean;
  /** Offered only in this event's window (SEASONS), and first while it is. */
  season?: SeasonId;
};

export const KEYBOARD_STYLES: readonly KeyboardStyle[] = [
  {
    id: "plain",
    label: "Plain",
    blurb: "Gold on black. Free to save.",
    box: { x: 0.08, y: 0.1, w: 0.84, h: 0.74 },
    page: "#0a0a0f",
    ink: ["#e8c460"],
    heading: "#e8c460",
    caption: "#b09070",
    footer: "#b09070",
    frame: true,
    hidden: true,
  },
  // Tattoo stencils (src/app/hieroglyphics-tattoo): black signs on white, nothing else, across or down the page.
  {
    id: "stencil",
    label: "Stencil",
    blurb: "Black on white, ready for a tattoo artist to trace.",
    box: { x: 0.06, y: 0.1, w: 0.88, h: 0.72 },
    page: "#FFFFFF",
    ink: ["#000000"],
    bold: 0.004,
    heading: "#000000",
    caption: "#333333",
    footer: "#9A9A9A",
    hidden: true,
  },
  {
    id: "stencil-tall",
    label: "Stencil, vertical",
    blurb: "Black on white, the signs in one column, read top to bottom.",
    box: { x: 0.12, y: 0.05, w: 0.76, h: 0.85 },
    footerY: 0.94,
    page: "#FFFFFF",
    ink: ["#000000"],
    bold: 0.004,
    heading: "#000000",
    caption: "#333333",
    footer: "#9A9A9A",
    hidden: true,
    portrait: true,
  },
  // The reward for sending a friend their name (src/lib/referral.ts)
  {
    id: "abusimbel",
    label: "Abu Simbel",
    blurb: "Over Ramesses II's great temple at Abu Simbel as the sun comes up. Unlocked by sending a friend their name.",
    art: "/keyboard-styles/abusimbel.jpg",
    art1200: "/keyboard-styles/abusimbel-1200.jpg",
    thumb: "/keyboard-styles/thumbs/abusimbel.jpg",
    box: { x: 0.08, y: 0.05, w: 0.84, h: 0.36 },
    footerY: 0.925,
    page: "#C98A4A",
    // dark against the pale dawn sky, as the Nile's palms are
    ink: ["#3B1D06"],
    bold: 0.009,
    heading: "#3B1D06",
    caption: "#4A2A0C",
    footer: "#FFF1D0",
    shadow: [{ x: 0, y: 0, blur: 0.08, color: "rgba(255,240,200,0.6)" }],
    hidden: true,
    bonus: true,
  },
  // Scenes, from scripts/dev/build-keyboard-photo-art.mjs: the writing sits in the open sky (or wall) above the horizon.
  // Seasonal scenes (2026-10-19, scripts/dev/build-keyboard-photo-art.mjs): offered only in their window (SEASONS),
  // first in the picker while they are. Old links still draw them out of season.
  {
    id: "valentine",
    label: "Valentine's",
    blurb: "Over the pyramids at dusk, with lotus flowers and rose petals on the water.",
    art: "/keyboard-styles/valentine.jpg",
    art1200: "/keyboard-styles/valentine-1200.jpg",
    thumb: "/keyboard-styles/thumbs/valentine.jpg",
    box: { x: 0.08, y: 0.05, w: 0.84, h: 0.42 },
    footerY: 0.925,
    page: "#D9789A",
    ink: ["#FFF2DE"],
    bold: 0.009,
    bevel: { dark: "#7A2448" },
    heading: "#FFF5EA",
    caption: "#FFEBDD",
    footer: "#FFF1E6",
    shadow: [
      { x: 0, y: 0.03, blur: 0.02, color: "rgba(90,20,50,0.55)" },
      { x: 0, y: 0, blur: 0.09, color: "rgba(255,200,220,0.45)" },
    ],
    lift: "0 2px 10px rgba(90,20,50,0.6)",
    season: "valentine",
  },
  {
    id: "mother",
    label: "Mother's Day",
    blurb: "A spring garden of blue lotus and papyrus by the temple of Hathor at Dendera.",
    art: "/keyboard-styles/mother.jpg",
    art1200: "/keyboard-styles/mother-1200.jpg",
    thumb: "/keyboard-styles/thumbs/mother.jpg",
    box: { x: 0.08, y: 0.05, w: 0.84, h: 0.4 },
    footerY: 0.925,
    page: "#9CC4E4",
    ink: ["#1C3566"],
    bold: 0.009,
    bevel: { light: "rgba(255,255,255,0.85)" },
    heading: "#1C3566",
    caption: "#22406E",
    footer: "#F6F3EA",
    shadow: [{ x: 0, y: 0, blur: 0.08, color: "rgba(255,255,255,0.55)" }],
    season: "mother",
  },
  {
    id: "father",
    label: "Father's Day",
    blurb: "Dark against a golden sky over the Colossi of Memnon, the twin statues of Amenhotep III.",
    art: "/keyboard-styles/father.jpg",
    art1200: "/keyboard-styles/father-1200.jpg",
    thumb: "/keyboard-styles/thumbs/father.jpg",
    box: { x: 0.08, y: 0.05, w: 0.84, h: 0.4 },
    footerY: 0.925,
    page: "#E89A2E",
    ink: ["#2A1205"],
    bold: 0.009,
    bevel: { light: "rgba(255,226,170,0.9)" },
    heading: "#2A1205",
    caption: "#3A1A08",
    footer: "#FFE2B0",
    shadow: [{ x: 0, y: 0, blur: 0.08, color: "rgba(255,210,130,0.5)" }],
    season: "father",
  },
  {
    id: "halloween",
    label: "Halloween",
    blurb: "A harvest moon over the pyramids, torches burning at a tomb door.",
    art: "/keyboard-styles/halloween.jpg",
    art1200: "/keyboard-styles/halloween-1200.jpg",
    thumb: "/keyboard-styles/thumbs/halloween.jpg",
    box: { x: 0.08, y: 0.05, w: 0.84, h: 0.42 },
    footerY: 0.925,
    page: "#1A1030",
    ink: ["#FFB347"],
    bold: 0.009,
    bevel: { dark: "#3A1404" },
    heading: "#FFB347",
    caption: "#F3D9B0",
    footer: "#F3D9B0",
    shadow: [
      { x: 0, y: 0.03, blur: 0.02, color: "rgba(0,0,0,0.75)" },
      { x: 0, y: 0, blur: 0.09, color: "rgba(255,150,40,0.45)" },
    ],
    lift: "0 2px 10px rgba(0,0,0,0.8)",
    season: "halloween",
  },
  {
    id: "newyear",
    label: "New Year",
    blurb: "Gold among the fireworks over Giza at midnight.",
    art: "/keyboard-styles/newyear.jpg",
    art1200: "/keyboard-styles/newyear-1200.jpg",
    thumb: "/keyboard-styles/thumbs/newyear.jpg",
    box: { x: 0.08, y: 0.05, w: 0.84, h: 0.42 },
    footerY: 0.925,
    page: "#0B1330",
    ink: ["#F6D27A"],
    bold: 0.009,
    bevel: { dark: "#3A2604" },
    heading: "#F2D27A",
    caption: "#E6DABA",
    footer: "#E6DABA",
    shadow: [
      { x: 0, y: 0.03, blur: 0.02, color: "rgba(0,0,0,0.7)" },
      { x: 0, y: 0, blur: 0.09, color: "rgba(242,210,122,0.4)" },
    ],
    lift: "0 2px 10px rgba(0,0,0,0.75)",
    season: "newyear",
  },
  {
    id: "christmas",
    label: "Christmas star",
    blurb: "A Christmas star over the pyramids, inside a garland of holly and gold.",
    art: "/keyboard-styles/christmas.jpg",
    art1200: "/keyboard-styles/christmas-1200.jpg",
    thumb: "/keyboard-styles/thumbs/christmas.jpg",
    box: { x: 0.1, y: 0.3, w: 0.8, h: 0.36 },
    footerY: 0.865,
    page: "#0A1430",
    ink: ["#FFF1CC"],
    bold: 0.009,
    bevel: { dark: "#5A1010" },
    heading: "#F4D27A",
    caption: "#F3E6C4",
    footer: "#F3E6C4",
    shadow: [
      { x: 0, y: 0.03, blur: 0.02, color: "rgba(0,0,0,0.75)" },
      { x: 0, y: 0, blur: 0.09, color: "rgba(255,226,150,0.4)" },
    ],
    lift: "0 2px 10px rgba(0,0,0,0.8)",
    season: "christmas",
  },
  {
    id: "pyramids",
    label: "Pyramids at sunset",
    blurb: "Written across the sky over Giza as the sun goes down.",
    art: "/keyboard-styles/pyramids.jpg",
    art1200: "/keyboard-styles/pyramids-1200.jpg",
    thumb: "/keyboard-styles/thumbs/pyramids.jpg",
    box: { x: 0.08, y: 0.05, w: 0.84, h: 0.42 },
    footerY: 0.925,
    page: "#C9672E",
    ink: ["#FFE7A3"],
    bold: 0.009,
    bevel: { dark: "#7A3414" },
    heading: "#FFF3D6",
    caption: "#FFE7BD",
    footer: "#FFF1D0",
    shadow: [
      { x: 0, y: 0.03, blur: 0.02, color: "rgba(70,18,40,0.55)" },
      { x: 0, y: 0, blur: 0.09, color: "rgba(255,214,140,0.4)" },
    ],
    lift: "0 2px 10px rgba(70,18,40,0.6)",
  },
  {
    id: "stars",
    label: "Giza by starlight",
    blurb: "Gold signs among the stars above the pyramids and the Sphinx.",
    art: "/keyboard-styles/stars.jpg",
    art1200: "/keyboard-styles/stars-1200.jpg",
    thumb: "/keyboard-styles/thumbs/stars.jpg",
    box: { x: 0.08, y: 0.08, w: 0.84, h: 0.5 },
    footerY: 0.93,
    page: "#0B1330",
    ink: ["#F6D27A"],
    bold: 0.009,
    bevel: { dark: "#3A2604" },
    heading: "#F2D27A",
    caption: "#E6DABA",
    footer: "#E6DABA",
    shadow: [
      { x: 0, y: 0.03, blur: 0.02, color: "rgba(0,0,0,0.7)" },
      { x: 0, y: 0, blur: 0.09, color: "rgba(242,210,122,0.4)" },
    ],
    lift: "0 2px 10px rgba(0,0,0,0.75)",
  },
  {
    id: "nile",
    label: "The Nile",
    blurb: "Dark as the palms against a Nile sunset, with a felucca under sail.",
    art: "/keyboard-styles/nile.jpg",
    art1200: "/keyboard-styles/nile-1200.jpg",
    thumb: "/keyboard-styles/thumbs/nile.jpg",
    box: { x: 0.08, y: 0.06, w: 0.84, h: 0.42 },
    footerY: 0.925,
    page: "#E8822E",
    ink: ["#2A1205"],
    bold: 0.009,
    bevel: { light: "rgba(255,226,170,0.9)" },
    heading: "#2A1205",
    caption: "#3A1A08",
    footer: "#FFE2B0",
    shadow: [{ x: 0, y: 0, blur: 0.08, color: "rgba(255,200,120,0.5)" }],
  },
  {
    id: "treasure",
    label: "Pharaoh's gold",
    blurb: "Gold on black inside a jewelled frame of lapis, carnelian and turquoise.",
    art: "/keyboard-styles/treasure.jpg",
    art1200: "/keyboard-styles/treasure-1200.jpg",
    thumb: "/keyboard-styles/thumbs/treasure.jpg",
    box: { x: 0.15, y: 0.22, w: 0.7, h: 0.5 },
    footerY: 0.735,
    page: "#0E0D0C",
    ink: ["#EBC664"],
    bold: 0.009,
    bevel: { dark: "#2E1E04" },
    heading: "#EBC664",
    caption: "#CDB98C",
    footer: "#9C8A64",
    shadow: [
      { x: 0, y: 0.03, blur: 0.02, color: "rgba(0,0,0,0.8)" },
      { x: 0, y: 0, blur: 0.09, color: "rgba(235,198,100,0.35)" },
    ],
  },
  {
    id: "karnak",
    label: "Karnak",
    blurb: "Carved into the wall of the great hall, in a shaft of morning light.",
    art: "/keyboard-styles/karnak.jpg",
    art1200: "/keyboard-styles/karnak-1200.jpg",
    thumb: "/keyboard-styles/thumbs/karnak.jpg",
    box: { x: 0.26, y: 0.16, w: 0.48, h: 0.6 },
    footerY: 0.9,
    page: "#B98A52",
    ink: ["#4A2A0C"],
    bold: 0.016,
    heading: "#4A2A0C",
    caption: "#4A2E12",
    footer: "#4A2E12",
    // Sunlit top-left edge, shadowed bottom-right: a sunk relief, as on the temple wall.
    shadow: [
      { x: -0.028, y: -0.028, blur: 0, color: "rgba(50,26,4,0.85)" },
      { x: 0.026, y: 0.026, blur: 0.012, color: "rgba(255,236,196,0.9)" },
    ],
  },
  {
    id: "papyrus",
    label: "Papyrus",
    blurb: "Dark ink on a sheet of aged papyrus.",
    art: "/keyboard-styles/papyrus.jpg",
    art1200: "/keyboard-styles/papyrus-1200.jpg",
    thumb: "/keyboard-styles/thumbs/papyrus.jpg",
    box: { x: 0.08, y: 0.1, w: 0.84, h: 0.74 },
    page: "#CF9246",
    ink: ["#24160a"],
    bold: 0.017,
    heading: "#3b2410",
    caption: "#4a3418",
    footer: "#4a3418",
  },
  {
    id: "night",
    label: "Lapis night",
    blurb: "Gold signs on a tomb ceiling of stars, inside a lotus border.",
    art: "/keyboard-styles/night.jpg",
    art1200: "/keyboard-styles/night-1200.jpg",
    thumb: "/keyboard-styles/thumbs/night.jpg",
    box: { x: 0.1, y: 0.17, w: 0.8, h: 0.6 },
    page: "#0F1F4A",
    ink: ["#E8C766"],
    heading: "#E4C766",
    caption: "#C9BE9E",
    footer: "#C9BE9E",
    shadow: [{ x: 0, y: 0, blur: 0.12, color: "rgba(232,199,102,0.45)" }],
    hidden: true,
  },
  {
    id: "temple",
    label: "Temple wall",
    blurb: "Carved into sandstone under the winged sun.",
    art: "/keyboard-styles/temple.jpg",
    art1200: "/keyboard-styles/temple-1200.jpg",
    thumb: "/keyboard-styles/thumbs/temple.jpg",
    box: { x: 0.07, y: 0.4, w: 0.86, h: 0.5 },
    page: "#C48643",
    ink: ["#4f2c0c"],
    bold: 0.016,
    heading: "#5A3812",
    caption: "#5A3E1C",
    footer: "#5A3E1C",
    // Sunlit top-left edge, shadowed bottom-right: a sunk relief.
    shadow: [
      { x: -0.028, y: -0.028, blur: 0, color: "rgba(50,26,4,0.85)" },
      { x: 0.026, y: 0.026, blur: 0.012, color: "rgba(255,232,186,0.9)" },
    ],
  },
  {
    id: "lotus",
    label: "Tomb painting",
    blurb: "Painted in lapis, ochre and malachite inside a lotus frieze.",
    art: "/keyboard-styles/lotus.jpg",
    art1200: "/keyboard-styles/lotus-1200.jpg",
    thumb: "/keyboard-styles/thumbs/lotus.jpg",
    box: { x: 0.13, y: 0.25, w: 0.74, h: 0.43 },
    footerY: 0.7,
    page: "#EADCC0",
    ink: ["#1F4E9C", "#A8432A", "#2F7D5B", "#2B2114"],
    bold: 0.02,
    heading: "#1F4E9C",
    caption: "#6E6455",
    footer: "#6E6455",
  },
] as const;

export const DEFAULT_KEYBOARD_STYLE: KeyboardStyleId = "plain";

export function isKeyboardStyle(id: unknown): id is KeyboardStyleId {
  return typeof id === "string" && KEYBOARD_STYLES.some((s) => s.id === id);
}

/** The finishes the pickers offer: every style but the retired and special ones, with the seasonal ones only in season. */
export const OFFERED_KEYBOARD_STYLES = KEYBOARD_STYLES.filter((s) => !s.hidden && !s.season);

/** Today's finishes: whatever event is on comes first, then the year-round scenes. */
export function offeredStyles(now: Date = new Date()): KeyboardStyle[] {
  const seasonal = KEYBOARD_STYLES.filter((s) => !s.hidden && s.season && inSeason(s.season, now));
  return [...seasonal, ...OFFERED_KEYBOARD_STYLES];
}

/** The finishes a referral unlocks, shown locked until then. */
export const BONUS_KEYBOARD_STYLES = KEYBOARD_STYLES.filter((s) => s.bonus);

export function keyboardStyleById(id: KeyboardStyleId): KeyboardStyle {
  return KEYBOARD_STYLES.find((s) => s.id === id) ?? KEYBOARD_STYLES[0];
}

/** A finish other than plain: kept by email, bought in HD, or free to members. */
export function isFinish(id: KeyboardStyleId): boolean {
  return id !== "plain";
}

/** The colour of the i-th sign: painted styles hand colours out by sign, so a sign keeps its colour. */
export function inkFor(style: KeyboardStyle, glyph: string): string {
  if (style.ink.length === 1) return style.ink[0];
  return style.ink[(glyph.codePointAt(0) ?? 0) % style.ink.length];
}

/** The shadows of one sign: the bevel's two rims, then the style's own (relief, glow). In em. */
function shadowsFor(style: KeyboardStyle): Shadow[] {
  // Just past the stroke's edge and never blurred, so each rim is a sharp sliver: lit above left, in shade below right
  const d = (style.bold ?? 0) + 0.014;
  const bevel: Shadow[] = [
    ...(style.bevel?.light ? [{ x: -d, y: -d, blur: 0, color: style.bevel.light }] : []),
    ...(style.bevel?.dark ? [{ x: d, y: d, blur: 0, color: style.bevel.dark }] : []),
  ];
  return [...bevel, ...(style.shadow ?? [])];
}

/**
 * CSS -webkit-text-stroke that thickens a sign by `bold` on every side, in its own ink: a real outline, so the edge
 * stays sharp at any size (a ring of offset shadows, as before 2026-10-18, smeared it). px for satori, else em.
 */
export function glyphStroke(style: KeyboardStyle, ink: string, sizePx?: number): string | undefined {
  if (!style.bold) return undefined;
  const w = style.bold * 2;
  return `${sizePx ? `${Math.round(w * sizePx * 100) / 100}px` : `${w}em`} ${ink}`;
}

/** CSS text-shadow for a sign: in px for a glyph of `sizePx` (satori takes no em), or in em when sizePx is omitted. */
export function glyphShadow(style: KeyboardStyle, ink: string, sizePx?: number): string | undefined {
  void ink;
  const list = shadowsFor(style);
  if (list.length === 0) return undefined;
  const len = (em: number) => (sizePx ? `${Math.round(em * sizePx * 100) / 100}px` : `${em}em`);
  return list.map((s) => `${len(s.x)} ${len(s.y)} ${len(s.blur)} ${s.color}`).join(", ");
}

/* ── Gift cards ─────────────────────────────────────────────────────── */

export type KeyboardTemplateId = "none" | "christmas" | "newyear" | "valentine" | "mother" | "father" | "halloween" | "birthday" | "pharaoh" | "love" | "thanks" | "dog" | "cat" | "pet" | "gift";

export type KeyboardTemplate = {
  id: KeyboardTemplateId;
  label: string;
  heading: string;
  /**
   * A silent sign after the name, as Egyptian scribes ended a name with a picture of what it named: the seated cat or
   * the dog (src/app/pet-name-in-hieroglyphics). It has no sound, so it has no letters under it.
   */
  det?: string;
  /** Not in the general card picker: the pet page and the gift certificate use these. */
  special?: boolean;
  /** Offered only in this event's window, straight after "No card". */
  season?: SeasonId;
  /** A line under the name (the gift certificate's "A lifetime of learning…"), then "From …" when a giver is named. */
  note?: string;
};

export const KEYBOARD_TEMPLATES: readonly KeyboardTemplate[] = [
  { id: "none", label: "No card", heading: "" },
  { id: "christmas", label: "Christmas", heading: "Merry Christmas", season: "christmas" },
  { id: "newyear", label: "New Year", heading: "Happy New Year", season: "newyear" },
  { id: "valentine", label: "Valentine's", heading: "Be My Valentine", season: "valentine" },
  { id: "mother", label: "Mother's Day", heading: "Happy Mother's Day", season: "mother" },
  { id: "father", label: "Father's Day", heading: "Happy Father's Day", season: "father" },
  { id: "halloween", label: "Halloween", heading: "Happy Halloween", season: "halloween" },
  { id: "birthday", label: "Birthday", heading: "Happy Birthday" },
  { id: "pharaoh", label: "For a child", heading: "Our Little Pharaoh" },
  { id: "love", label: "With love", heading: "With Love" },
  { id: "thanks", label: "Thank you", heading: "Thank You" },
  { id: "dog", label: "Dog", heading: "Good Dog", det: "𓃡", special: true },
  { id: "cat", label: "Cat", heading: "Sacred Cat", det: "𓃠", special: true },
  { id: "pet", label: "Any pet", heading: "Best Friend", special: true },
  { id: "gift", label: "Gift", heading: "A Gift for", special: true, note: "A lifetime of learning to read hieroglyphs" },
] as const;

export function isKeyboardTemplate(id: unknown): id is KeyboardTemplateId {
  return typeof id === "string" && KEYBOARD_TEMPLATES.some((t) => t.id === id);
}

/** 1 November to Christmas Day: names are bought as presents, so the gift cards lead. */
export function isGiftSeason(now: Date = new Date()): boolean {
  return inSeason("christmas", now);
}

/**
 * The cards the picker offers, in order: in gift season Christmas comes straight after "No card"; out of it
 * Christmas is not offered (a link that carries it still draws it).
 */
export function offeredTemplates(now: Date = new Date()) {
  const general = KEYBOARD_TEMPLATES.filter((t) => !t.special && (!t.season || inSeason(t.season, now)));
  // an event's card straight after "No card"
  return [...general.filter((t) => t.id === "none"), ...general.filter((t) => t.season), ...general.filter((t) => t.id !== "none" && !t.season)];
}

export function keyboardTemplateById(id: KeyboardTemplateId) {
  return KEYBOARD_TEMPLATES.find((t) => t.id === id) ?? KEYBOARD_TEMPLATES[0];
}

/* ── Layout, on a 1200 × 630 card ───────────────────────────────────── */

export const CARD = { width: 1200, height: 630 } as const;
export const CARD_HD = { width: 2400, height: 1260 } as const;

/** The card's size for a style: landscape, or turned on end for a portrait stencil; doubled for HD. */
export function cardSize(style: KeyboardStyle, hd = false): { width: number; height: number } {
  const k = hd ? 2 : 1;
  return style.portrait ? { width: CARD.height * k, height: CARD.width * k } : { width: CARD.width * k, height: CARD.height * k };
}

/** Average Noto Egyptian advance in em, a little generous so a wide run never spills out of the box. */
const GLYPH_ADVANCE = 0.92;
const LINE_HEIGHT = 1.3;
const MAX_GLYPH = 150;
/** The cartouche's rope loop, in em of the glyph size. */
export const CARTOUCHE = { padX: 0.45, padY: 0.12, tie: 0.18, rope: 0.045 } as const;

/** How the text becomes signs: one per key (the keyboard), or by sound like the name translator. */
export type CardSpell = "keys" | "name";

/** A sign and the English letters it stands for ("SH" for a name's one sign), " " for both between words. */
type Cell = { glyph: string; letters: string };

function cardCellsWithLetters(typed: string[], spell: CardSpell): Cell[][] {
  return typed
    .join("")
    .split(" ")
    .filter(Boolean)
    .map((w) =>
      spell === "name"
        ? transliterateName(w).map((r) => ({ glyph: r.mapping.glyph, letters: r.input.toUpperCase() }))
        : [...w].flatMap((k) => {
            const glyph = signForKey(k)?.glyph;
            return glyph ? [{ glyph, letters: k.toUpperCase() }] : [];
          }),
    )
    .filter((w) => w.length > 0);
}

/** The signs to draw, one per cell, with " " between words. */
export function cardCells(typed: string[], spell: CardSpell = "keys"): string[] {
  return cardCellsWithLetters(typed, spell).flatMap((w, i) => [...(i > 0 ? [" "] : []), ...w.map((c) => c.glyph)]);
}

const SPACE: Cell = { glyph: " ", letters: " " };

/** Words of cells into lines of at most `perLine` cells, broken at spaces where it can: wrapTyped's rule, keeping each sign's letters. */
function wrapCells(words: Cell[][], perLine: number): Cell[][] {
  const lines: Cell[][] = [];
  let line: Cell[] = [];
  for (const word of words) {
    let rest = word;
    if (line.length > 0 && line.length + 1 + rest.length > perLine) {
      lines.push(line);
      line = [];
    }
    if (line.length > 0) line.push(SPACE);
    while (rest.length > perLine) {
      lines.push(rest.slice(0, perLine));
      rest = rest.slice(perLine);
    }
    line.push(...rest);
  }
  if (line.length > 0) lines.push(line);
  return lines;
}

/** The letters under each sign, in em of the glyph size: their size and the line they add. */
export const LETTERS = { size: 0.22, line: 0.32 } as const;

export type CardLayout = {
  /** Glyph cells per line (" " between words). */
  lines: string[][];
  /** The English letters under each cell, line by line (" " between words); empty when letters are off. */
  letters: string[][];
  /** The name's rope loop around the signs (spell "name"). */
  cartouche: boolean;
  /** One sign a line, down a portrait card: the loop stands upright with its tie at the foot. */
  column: boolean;
  /** All in px on the 1200-wide card; scale by width / 1200. */
  glyph: number;
  heading: number;
  caption: number;
  headingText: string;
  captionText: string;
  /** Lines under the caption (the gift certificate's note and "From …"), at `note` px. */
  noteLines: string[];
  note: number;
  box: { x: number; y: number; w: number; h: number };
};

/** A giver's name for the card ("From Harry"): letters, spaces, hyphens and apostrophes, up to 30. */
export function cleanFrom(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/[^\p{L}\p{M}' -]/gu, "").replace(/\s+/g, " ").trim().slice(0, 30);
}

/**
 * Lines and sizes for the typed keys: every way of wrapping is tried and the one that lets the signs be
 * largest wins. A gift card sets a heading above and the letters below, inside the same box.
 */
export function cardLayout(
  typed: string[],
  styleId: KeyboardStyleId,
  templateId: KeyboardTemplateId = "none",
  spell: CardSpell = "keys",
  letters = false,
  from = "",
): CardLayout {
  const cartouche = spell === "name";
  const style = keyboardStyleById(styleId);
  const template = keyboardTemplateById(templateId);
  const size = cardSize(style);
  // A portrait card writes down the page, one sign under another
  const column = !!style.portrait;
  const box = {
    x: style.box.x * size.width,
    y: style.box.y * size.height,
    w: style.box.w * size.width,
    h: style.box.h * size.height,
  };
  const headingText = template.heading;
  // A gift card spells the text out under the signs, unless the letters already sit under each sign
  const captionText = headingText && !letters ? typed.join("").trim().toUpperCase() : "";
  // a card with a note under the name (the gift certificate) trims its heading so the signs keep their size
  const headingShare = template.note ? 0.15 : 0.2;
  const heading = headingText ? Math.min(64, box.h * headingShare, (box.w / headingText.length) * 1.4) : 0;
  const caption = captionText ? Math.min(30, box.h * 0.09, (box.w / Math.max(captionText.length, 1)) * 1.1) : 0;
  const giver = cleanFrom(from);
  const noteLines = template.note ? [template.note, ...(giver ? [`From ${giver}`] : [])] : [];
  const note = noteLines.length ? Math.min(24, box.h * 0.068, (box.w / Math.max(...noteLines.map((l) => l.length))) * 1.5) : 0;
  const glyphBoxH = box.h - (heading ? heading * 1.35 : 0) - (caption ? caption * 1.8 : 0) - noteLines.length * note * 1.35;

  const words = cardCellsWithLetters(typed, spell);
  // A pet's silent sign closes the name (no sound, so no letters under it)
  if (template.det && words.length > 0) words[words.length - 1] = [...words[words.length - 1], { glyph: template.det, letters: "" }];
  const count = words.reduce((n, w) => n + w.length, 0) + Math.max(words.length - 1, 0);
  // The rope loop: padding either side, the tie on the right (at the foot when it stands upright), head and foot room (em).
  const extraW = cartouche ? (column ? CARTOUCHE.padY * 2 + 0.1 : CARTOUCHE.padX * 2 + CARTOUCHE.tie) : 0;
  const extraH = cartouche ? (column ? CARTOUCHE.padX * 2 + CARTOUCHE.tie : CARTOUCHE.padY * 2) : 0;
  const lineH = LINE_HEIGHT + (letters ? LETTERS.line : 0);
  let best: { lines: Cell[][]; glyph: number } = { lines: [], glyph: 0 };
  // A cartouche holds the name on one line, as on the monuments; the keyboard's text wraps; a column is one sign a line.
  const most = column ? 1 : Math.max(count, 1);
  const fewest = column ? 1 : cartouche ? Math.max(count, 1) : 1;
  for (let perLine = most; perLine >= fewest; perLine--) {
    const lines = wrapCells(words, perLine);
    if (lines.length === 0) break;
    const widest = Math.max(...lines.map((l) => l.reduce((w, c) => w + (c.glyph === " " ? 0.5 : GLYPH_ADVANCE), 0))) + extraW;
    const glyph = Math.min(MAX_GLYPH, box.w / widest, glyphBoxH / (lines.length * lineH + extraH));
    if (glyph > best.glyph) best = { lines, glyph };
  }
  return {
    lines: best.lines.map((l) => l.map((c) => c.glyph)),
    letters: letters ? best.lines.map((l) => l.map((c) => c.letters)) : [],
    cartouche,
    column,
    glyph: Math.floor(best.glyph),
    heading,
    caption,
    headingText,
    captionText,
    noteLines,
    note,
    box,
  };
}

/* ── Keys in a URL: the secret message, the email link, the checkout ── */

/** Only what the keyboard can type: a–z and single spaces, up to the wall's length. */
export function cleanKeys(raw: string, max = 120): string[] {
  const s = raw.toLowerCase().replace(/[^a-z ]/g, "").replace(/ +/g, " ").trim().slice(0, max);
  return s ? [...s] : [];
}

/** A name as the translator takes it: letters of any script, words split at spaces and hyphens, 30 at most. */
export function cleanName(raw: string): string[] {
  const s = raw
    .normalize("NFC")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/[^\p{L}\p{M} ]/gu, "")
    .replace(/ +/g, " ")
    .trim()
    .slice(0, 30);
  return s ? [...s] : [];
}

export function cleanText(raw: string, spell: CardSpell = "keys"): string[] {
  return spell === "name" ? cleanName(raw) : cleanKeys(raw);
}

/** base64url of the UTF-8 text, so a secret message does not read itself out of the link. */
export function encodeMessage(typed: string[]): string {
  const bytes = new TextEncoder().encode(typed.join("").trim());
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const b64 = typeof btoa === "function" ? btoa(bin) : Buffer.from(bin, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeMessage(m: string | null | undefined, spell: CardSpell = "keys"): string[] {
  if (!m || m.length > 400 || !/^[A-Za-z0-9_-]+$/.test(m)) return [];
  try {
    const b64 = m.replace(/-/g, "+").replace(/_/g, "/");
    const bin = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
    const text = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    return cleanText(text, spell);
  } catch {
    return [];
  }
}

export const KEYBOARD_MESSAGE_PATH = "/hieroglyphics-keyboard/message";
export const KEYBOARD_HD_PATH = "/hieroglyphics-keyboard/hd";
export const KEYBOARD_IMAGE_ROUTE = "/keyboard-image";

export type CardParams = {
  typed: string[];
  style: KeyboardStyleId;
  template?: KeyboardTemplateId;
  spell?: CardSpell;
  letters?: boolean;
  /** Who the card is from (the gift certificate's "From Harry"); only cards with a note show it. */
  from?: string;
};

function cardQuery({ typed, style, template = "none", spell = "keys", letters = false, from = "" }: CardParams): string {
  const q = new URLSearchParams({ m: encodeMessage(typed), s: style });
  if (template !== "none") q.set("g", template);
  if (spell === "name") q.set("t", "n");
  if (letters) q.set("l", "1");
  const giver = cleanFrom(from);
  if (giver) q.set("f", giver);
  return q.toString();
}

/** The free share-size picture (with the site's address). */
export function keyboardImagePath(p: CardParams): string {
  return `${KEYBOARD_IMAGE_ROUTE}?${cardQuery(p)}`;
}

/** The secret message (or name puzzle): the decode page, in the finish it was sent in. */
export function keyboardMessagePath(typed: string[], style: KeyboardStyleId, spell: CardSpell = "keys"): string {
  return `${KEYBOARD_MESSAGE_PATH}?${cardQuery({ typed, style, spell })}`;
}

/**
 * Back to the page the card was made on, restored (the emails' and checkouts' links): the keyboard, or
 * the translator's share page for a name.
 */
export function keyboardRestorePath(p: CardParams, extra: Record<string, string> = {}): string {
  const q = new URLSearchParams(cardQuery(p));
  for (const [k, v] of Object.entries(extra)) q.set(k, v);
  if (p.spell === "name") {
    q.delete("m");
    q.delete("t");
    return `/translate-name-to-hieroglyphics/${encodeURIComponent(p.typed.join("").trim())}?${q.toString()}`;
  }
  return `/hieroglyphics-keyboard?${q.toString()}`;
}

/** Read m / s / g / t / l from a query string; anything unknown falls back rather than failing. */
export function readCardParams(get: (key: string) => string | null): Required<CardParams> {
  const s = get("s");
  const g = get("g");
  const spell: CardSpell = get("t") === "n" ? "name" : "keys";
  return {
    typed: decodeMessage(get("m"), spell),
    style: isKeyboardStyle(s) ? s : DEFAULT_KEYBOARD_STYLE,
    template: isKeyboardTemplate(g) ? g : "none",
    spell,
    letters: get("l") === "1",
    from: cleanFrom(get("f")),
  };
}

export function keyboardImageFilename(typed: string[], style: KeyboardStyleId, hd = false): string {
  const slug =
    typed
      .join("")
      .trim()
      .normalize("NFD")
      .replace(/[^a-z ]/g, "")
      .replace(/ +/g, "-")
      .slice(0, 40) || "hieroglyphs";
  return `${slug}-hieroglyphs-${style}${hd ? "-hd" : ""}.jpg`;
}

/* ── The HD image, bought ───────────────────────────────────────────── */

export const KEYBOARD_HD = {
  /** Checkout Session metadata.product; the webhook keys on it. */
  id: "keyboard-image",
  name: "Hieroglyphs picture, HD",
  description: "Your hieroglyphs as a 2400 × 1260 picture on the finish you chose, without our web address.",
  usd: 3.99,
  gbp: 2.99,
} as const;

export function keyboardHdPrice(currency: "USD" | "GBP"): string {
  return currency === "GBP" ? `£${KEYBOARD_HD.gbp.toFixed(2)}` : `$${KEYBOARD_HD.usd.toFixed(2)}`;
}

/* ── Reading it back: transliteration and real words ────────────────── */

/** Egyptologists' transliteration of the typed keys, word by word (English keyboard). */
export function typedTransliteration(typed: string[]): string {
  return typed
    .join("")
    .split(" ")
    .filter(Boolean)
    .map((w) => [...w].map((k) => signForKey(k)?.transliteration ?? "").join(""))
    .join(" ");
}

export type SpottedWord = { typed: string; glyphs: string; translit: string; say: string; meaning: string; why: string };

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * The last typed word that is also a word from Lesson 1 (src/lib/content/uniliteral-words.ts): matched by
 * its transliteration, or by its consonants alone, since Egyptian wrote no vowels (PET → pt, sky).
 */
export function spotWord(typed: string[]): SpottedWord | null {
  const words = typed.join("").split(" ").filter(Boolean);
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i];
    if (w.length < 2) continue;
    const full = [...w].map((k) => signForKey(k)?.transliteration ?? "").join("");
    const consonants = [...w].filter((k) => !VOWELS.has(k)).map((k) => signForKey(k)?.transliteration ?? "").join("");
    const hit = WORDS.find((x) => x.translit === full || (consonants.length >= 2 && x.translit === consonants));
    if (hit) {
      return { typed: w, glyphs: hit.core.join(""), translit: hit.translit, say: hit.say, meaning: hit.meaning, why: hit.why };
    }
  }
  return null;
}

/** Short enough, and made of letters, to go in a cartouche (the print's own name rule): the print offer's name. */
export function printableName(typed: string[]): string | null {
  const text = typed.join("").trim();
  if (!text || text.split(" ").length > 3 || text.replace(/ /g, "").length > 24) return null;
  return normaliseShareName(text);
}
