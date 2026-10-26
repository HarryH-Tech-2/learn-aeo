/**
 * "Your pharaoh title" on the name translator (2026-10-16): the name with two royal epithets, the way
 * kings' names were followed by praise on the monuments ("Ramesses, beloved of Amun, given life").
 * Picked by the name, so the same name always gets the same title and can be shared.
 *
 * Every group is a real, common epithet; the code points were checked against Unicode names (Gardiner
 * numbers in the comments). Amun and Thoth come first in writing, out of respect, though read after "beloved".
 */

export type Epithet = { en: string; translit: string; glyphs: string };

export const EPITHETS: readonly Epithet[] = [
  // M17 Y5 N35 (Amun) + U6 (mr, "beloved")
  { en: "Beloved of Amun", translit: "mry Jmn", glyphs: "\u{131CB}\u{133E0}\u{13216}\u{13338}" },
  // G26 (Thoth on his standard) + U6
  { en: "Beloved of Thoth", translit: "mry Ḏḥwty", glyphs: "\u{1315D}\u{13338}" },
  // G39 (pintail duck, sꜣ "son") + N5 (sun, Ra)
  { en: "Son of Ra", translit: "sꜣ Rꜥ", glyphs: "\u{1316D}\u{131F3}" },
  // S34 (ankh) + I10 X1 N17 (ḏt, "forever")
  { en: "Living Forever", translit: "ꜥnḫ ḏt", glyphs: "\u{132F9}\u{13193}\u{133CF}\u{131FF}" },
  // V30 (basket, nb "lord") + N16 N16 (tꜣwy, "the Two Lands")
  { en: "Lord of the Two Lands", translit: "nb tꜣwy", glyphs: "\u{1339F}\u{131FE}\u{131FE}" },
  // D37 (dj, "given") + S34 (ankh, "life")
  { en: "Given Life", translit: "dj ꜥnḫ", glyphs: "\u{1309E}\u{132F9}" },
  // E1 (bull, kꜣ) + D40 (nḫt, "strong"), the opening of many Horus names
  { en: "Strong Bull", translit: "kꜣ nḫt", glyphs: "\u{130D2}\u{130A1}" },
] as const;

function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Two different epithets for a name, always the same two for the same name (case and spaces ignored). */
export function pharaohTitle(name: string): [Epithet, Epithet] {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  const h = hash(key);
  const a = h % EPITHETS.length;
  const b = (a + 1 + ((h >>> 8) % (EPITHETS.length - 1))) % EPITHETS.length;
  return [EPITHETS[a], EPITHETS[b]];
}

/** "Cleopatra, Beloved of Amun, Living Forever" */
export function pharaohTitleText(name: string): string {
  const shown = name.trim().replace(/\s+/g, " ");
  const [a, b] = pharaohTitle(name);
  return `${shown.charAt(0).toUpperCase()}${shown.slice(1)}, ${a.en}, ${b.en}`;
}
