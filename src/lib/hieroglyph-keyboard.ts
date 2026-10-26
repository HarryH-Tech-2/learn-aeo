/**
 * The hieroglyphics keyboard (/hieroglyphics-keyboard): one key, one sign.
 *
 * Signs come from the name translator's table (src/lib/hieroglyph-translator.ts), so a letter typed here
 * and the same letter in a translated name can never disagree. The difference is that the keyboard does
 * not listen for sounds: it has no digraphs (S then H is two signs), no soft C and no dropped double
 * letters. The page sends name-writers to the translator for that.
 */
import { getAlphabetMappings, type HieroglyphMapping } from "@/lib/hieroglyph-translator";

export const KEY_ROWS: string[][] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

/** Longest line the page keeps (signs and spaces): enough for a sentence, short enough to fit one image. */
export const MAX_TYPED = 120;

const BY_KEY: Record<string, HieroglyphMapping> = Object.fromEntries(
  getAlphabetMappings()
    .filter((m) => m.input.length === 1)
    .map((m) => [m.input, m])
);

/** The 26 letter keys in alphabetical order, for the chart under the keyboard. */
export const KEY_SIGNS: HieroglyphMapping[] = Object.keys(BY_KEY)
  .sort()
  .map((k) => BY_KEY[k]);

/**
 * The keyboard's language (the Spanish and French pages, src/lib/i18n.ts). English types only A–Z, as before.
 * Spanish and French also take the accented letters their keyboards have (é, è, à, ñ, ü…), typed as the
 * plain letter, and ç as the s it sounds like. One key sounds different enough to change sign: Spanish J is
 * the throaty "jota" of jamón, which Egyptian had as ḫ, the placenta 𓐍. French J (jour) keeps the cobra.
 */
export type KeyboardLocale = "en" | "es" | "fr";

const LOCALE_SIGNS: Partial<Record<KeyboardLocale, Record<string, HieroglyphMapping>>> = {
  es: {
    j: {
      input: "j",
      gardiner: "Aa1",
      transliteration: "ḫ",
      signName: "Placenta",
      glyph: "\u{1340D}",
      note: "Spanish J (as in jamón) is the throaty sound Egyptian wrote as ḫ, shown by the placenta.",
    },
  },
};

/** A key as the keyboard reads it: lower case, and for Spanish and French, accents folded to the plain letter. */
export function foldKey(key: string, locale: KeyboardLocale = "en"): string {
  const k = key.toLowerCase();
  if (locale === "en" || k.length !== 1) return k;
  if (k === "ç") return "s";
  return k.normalize("NFD").replace(/\p{M}/gu, "");
}

/** The sign a key types, or null for anything that is not a letter A–Z (or, in Spanish and French, an accented letter). */
export function signForKey(key: string, locale: KeyboardLocale = "en"): HieroglyphMapping | null {
  const k = foldKey(key, locale);
  if (k.length !== 1) return null;
  return LOCALE_SIGNS[locale]?.[k] ?? BY_KEY[k] ?? null;
}

/** The 26 letter keys and their signs in alphabetical order, for the chart, in the keyboard's language. */
export function keySigns(locale: KeyboardLocale = "en"): HieroglyphMapping[] {
  return KEY_SIGNS.map((s) => LOCALE_SIGNS[locale]?.[s.input] ?? s);
}

/** What has been typed, as hieroglyphs: spaces stay spaces, so words can be told apart after a paste. */
export function typedToHieroglyphs(typed: string[], locale: KeyboardLocale = "en"): string {
  return typed
    .map((k) => (k === " " ? " " : (signForKey(k, locale)?.glyph ?? "")))
    .join("")
    .trim();
}

/** The typed keys with one more: nothing past the cap, no leading or doubled spaces. Keys are stored folded. */
export function appendKey(typed: string[], key: string, locale: KeyboardLocale = "en"): string[] {
  if (typed.length >= MAX_TYPED) return typed;
  if (key === " ") return typed.length === 0 || typed[typed.length - 1] === " " ? typed : [...typed, " "];
  return signForKey(key, locale) ? [...typed, foldKey(key, locale)] : typed;
}

/** Break typed keys into lines of at most `perLine` cells for the saved image, at spaces where it can. */
export function wrapTyped(typed: string[], perLine: number): string[][] {
  const lines: string[][] = [];
  let line: string[] = [];
  const words = typed.join("").split(" ").filter(Boolean);
  for (const word of words) {
    let rest = [...word];
    if (line.length > 0 && line.length + 1 + rest.length > perLine) {
      lines.push(line);
      line = [];
    }
    if (line.length > 0) line.push(" ");
    while (rest.length > perLine) {
      lines.push(rest.slice(0, perLine));
      rest = rest.slice(perLine);
    }
    line.push(...rest);
  }
  if (line.length > 0) lines.push(line);
  return lines;
}
