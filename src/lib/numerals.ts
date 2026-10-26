/**
 * Egyptian numerals — pure helpers for the Treasury lesson (Counting House).
 *
 * The system is decimal and additive: one sign per power of ten, repeated
 * up to nine times, larger values written first. No zero, no place value.
 */

export type NumeralSign = {
  value: number;
  glyph: string;
  name: string;
  /** Conventional reading */
  translit: string;
  note: string;
};

// Unicode code points verified against the Gardiner sign list.
export const NUMERAL_SIGNS: NumeralSign[] = [
  { value: 1, glyph: "𓏤", name: "single stroke", translit: "wꜥ", note: "A tally stroke. Strokes are grouped in neat rows: 4 is 𓏤𓏤𓏤𓏤, never a new sign." }, // Z1
  { value: 10, glyph: "𓎆", name: "cattle hobble", translit: "mḏ", note: "An arch, usually read as a hobble for cattle. Ten of anything." }, // V20
  { value: 100, glyph: "𓍢", name: "coil of rope", translit: "št", note: "A coil of rope. A hundred of anything." }, // V1
  { value: 1_000, glyph: "𓆼", name: "lotus plant", translit: "ḫꜣ", note: "A lotus on its stalk; the Nile marshes produced them in their thousands." }, // M12
  { value: 10_000, glyph: "𓂭", name: "bent finger", translit: "ḏbꜥ", note: "A raised finger, perhaps from counting on the hands. Ten thousand." }, // D50
  { value: 100_000, glyph: "𓆐", name: "tadpole", translit: "ḥfn", note: "Tadpoles swarm in the flood pools past counting: a hundred thousand." }, // I8
  { value: 1_000_000, glyph: "𓁨", name: "god Heh", translit: "ḥḥ", note: "Heh, the god of endless years, kneeling with both arms raised: a million, or simply ‘countless’." }, // C11
];

export const MAX_NUMBER = 9_999_999;

/** Write `n` in hieroglyphic numerals, largest sign first. */
export function toHieroglyphic(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > MAX_NUMBER) throw new RangeError(`out of range: ${n}`);
  let out = "";
  let rest = n;
  for (const sign of [...NUMERAL_SIGNS].reverse()) {
    const count = Math.floor(rest / sign.value);
    rest -= count * sign.value;
    out += sign.glyph.repeat(count);
  }
  return out;
}

/** Break `n` into [sign, count] pairs, largest first (for laying out groups). */
export function decompose(n: number): { sign: NumeralSign; count: number }[] {
  if (!Number.isInteger(n) || n < 1 || n > MAX_NUMBER) throw new RangeError(`out of range: ${n}`);
  const parts: { sign: NumeralSign; count: number }[] = [];
  let rest = n;
  for (const sign of [...NUMERAL_SIGNS].reverse()) {
    const count = Math.floor(rest / sign.value);
    rest -= count * sign.value;
    if (count > 0) parts.push({ sign, count });
  }
  return parts;
}

/** Read a string of numeral signs (any order) back to a number; null if it contains anything else. */
export function fromHieroglyphic(s: string): number | null {
  let total = 0;
  let any = false;
  for (const ch of s) {
    if (/\s/.test(ch)) continue;
    const sign = NUMERAL_SIGNS.find((x) => x.glyph === ch);
    if (!sign) return null;
    total += sign.value;
    any = true;
  }
  return any ? total : null;
}

/** Same number whatever the tile order — compare by value, not by string. */
export function sameNumber(tiles: string[], n: number): boolean {
  return fromHieroglyphic(tiles.join("")) === n;
}

/** Is this a *well-formed* writing (no sign repeated more than 9×)? */
export function wellFormed(tiles: string[]): boolean {
  const counts = new Map<string, number>();
  for (const t of tiles) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.values()].every((c) => c <= 9);
}

export type Rng = () => number;

/** A random number whose decomposition uses at most `maxSigns` signs in total. */
export function randomNumber(min: number, max: number, rng: Rng = Math.random, maxSigns = 12): number {
  for (let i = 0; i < 200; i++) {
    const n = min + Math.floor(rng() * (max - min + 1));
    const total = decompose(n).reduce((s, p) => s + p.count, 0);
    if (total <= maxSigns) return n;
  }
  return min;
}

/* ─────────────────────── fractions (mouth sign) ─────────────────────── */

/** r + number = 1/n  (𓂋 over the strokes). Special signs exist for ½ and ⅔; we teach the general rule. */
export const FRACTION_SIGN = "𓂋"; // D21 mouth

export function unitFraction(denominator: number): string {
  if (!Number.isInteger(denominator) || denominator < 2 || denominator > 99) throw new RangeError("2–99 only");
  return FRACTION_SIGN + toHieroglyphic(denominator);
}
