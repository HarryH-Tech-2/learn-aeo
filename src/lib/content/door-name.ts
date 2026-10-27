/**
 * Lesson 1's sealed door: the learner's own name, carved on the lintel and
 * buried under sand. Each sign they brush clear is a ten-second lesson; the
 * door only opens once the name reads. The signs of the name then become the
 * first sign group, so the alphabet arrives in the order the learner needs it.
 */
import type { GlyphGroup, Hieroglyph } from "@/lib/legacy-lessons";
import { transliterateName } from "@/lib/hieroglyph-translator";

export type DoorCell = {
  /** The letter(s) of the name this sign writes: "h", "sh", "a" */
  letter: string;
  /** Why this letter became this sign (from the translator) */
  note: string;
  glyph: Hieroglyph;
};

export type DoorName = {
  name: string;
  cells: DoorCell[];
  /** Distinct signs, in order of first appearance: the first sign group */
  signs: Hieroglyph[];
};

/** Longest name the lintel will hold before it stops reading as one cartouche. */
export const MAX_DOOR_CELLS = 10;

/** The default owner of the door when no name is given: the builder of the Great Pyramid. */
export const DEFAULT_DOOR_NAME = "Khufu";

const KHUFU: { letter: string; symbol: string; note: string }[] = [
  { letter: "kh", symbol: "𓐍", note: "The sieve writes ḫ, a sound from the back of the throat like the ch in Scottish ‘loch’." },
  { letter: "u", symbol: "𓅱", note: "Egyptian wrote no vowels. The quail chick, w, stands in for the ‘oo’." },
  { letter: "f", symbol: "𓆑", note: "The horned viper is f, the same sound in Egyptian and English." },
  { letter: "u", symbol: "𓅱", note: "The chick again: Khufu is spelled ḫ-w-f-w, and the Greeks heard ‘Cheops’." },
];

function distinct(cells: DoorCell[]): Hieroglyph[] {
  const seen = new Set<string>();
  const out: Hieroglyph[] = [];
  for (const c of cells) {
    if (seen.has(c.glyph.symbol)) continue;
    seen.add(c.glyph.symbol);
    out.push(c.glyph);
  }
  return out;
}

/**
 * Turn a name into door cells, keeping only signs the lesson teaches. A
 * name with no usable letters (or none given) falls back to Khufu.
 */
export function doorForName(rawName: string | null | undefined, lessonGlyphs: Hieroglyph[]): DoorName {
  const bySymbol = new Map(lessonGlyphs.map((g) => [g.symbol, g]));
  const name = (rawName ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
  const first = name.split(" ")[0] ?? "";

  const cells: DoorCell[] = [];
  if (first) {
    for (const r of transliterateName(first)) {
      // "x" maps to two signs (k + s); each code point is its own cell.
      const points = [...r.mapping.glyph];
      points.forEach((symbol, i) => {
        const glyph = bySymbol.get(symbol);
        if (!glyph) return;
        cells.push({ letter: points.length > 1 ? r.mapping.transliteration[i] : r.input, note: r.mapping.note, glyph });
      });
    }
  }

  if (cells.length === 0) {
    const khufu = KHUFU.flatMap((k) => {
      const glyph = bySymbol.get(k.symbol);
      return glyph ? [{ letter: k.letter, note: k.note, glyph }] : [];
    });
    return { name: DEFAULT_DOOR_NAME, cells: khufu, signs: distinct(khufu) };
  }

  const trimmed = cells.slice(0, MAX_DOOR_CELLS);
  return { name: first, cells: trimmed, signs: distinct(trimmed) };
}

/**
 * Re-order the lesson's groups so the door's signs come first as their own
 * group. Later groups lose those signs; a group emptied entirely is dropped.
 */
export function nameFirstGroups(groups: GlyphGroup[], doorSigns: Hieroglyph[]): GlyphGroup[] {
  if (doorSigns.length === 0) return groups;
  const taken = new Set(doorSigns.map((g) => g.symbol));
  const rest = groups
    .map((g) => ({ ...g, glyphs: g.glyphs.filter((h) => !taken.has(h.symbol)) }))
    .filter((g) => g.glyphs.length > 0);
  return [{ glyphs: doorSigns, contextImage: groups[0]?.contextImage ?? "" }, ...rest];
}
