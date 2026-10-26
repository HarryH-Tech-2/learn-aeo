/**
 * Hieroglyphic Name Transliteration Engine
 *
 * Transliterates modern English names into ancient Egyptian hieroglyphs
 * using the 24 standard uniliteral (single-consonant) signs.
 *
 * Key Egyptological principles:
 * - Egyptian hieroglyphs are consonantal — no true vowels were written
 * - Vowels are approximated using semi-vowels: j (reed) for i/e, w (quail) for o/u
 * - The vulture (ꜣ) serves as a glottal stop and approximates 'a'
 * - Classical Egyptian had no separate sign for l — names write it with the mouth sign (r)
 * - Digraphs (sh, ch, kh, th, ph) map to single Egyptian sounds
 *
 * References: Gardiner's Egyptian Grammar (3rd ed., 1957), Sign List
 */

import {
  FRENCH_RULES,
  LETTER_NOTES,
  SIGN_NAMES,
  SPANISH_RULES,
  dropFrenchSilentEnding,
  type IntlLocale,
  type TranslatorLocale,
} from "@/lib/hieroglyph-translator-locales";

export type { TranslatorLocale } from "@/lib/hieroglyph-translator-locales";

export type HieroglyphMapping = {
  /** The input letter(s) this mapping handles */
  input: string;
  /** Gardiner sign list code */
  gardiner: string;
  /** Egyptian transliteration symbol */
  transliteration: string;
  /** Name of the sign (what the glyph depicts) */
  signName: string;
  /** Unicode character for the hieroglyph */
  glyph: string;
  /** Educational note explaining the mapping */
  note: string;
};

/** Result for a single character/digraph in the input name */
export type TransliterationResult = {
  /** Original input letter(s) */
  input: string;
  /** The mapping used */
  mapping: HieroglyphMapping;
};

/**
 * The 24 uniliteral signs plus vowel approximations,
 * mapped from English letters/digraphs.
 *
 * Digraphs are checked first (sh, ch, th, ph) before single letters.
 */
const DIGRAPH_MAPPINGS: HieroglyphMapping[] = [
  {
    input: "sh",
    gardiner: "N37",
    transliteration: "š",
    signName: "Pool",
    glyph: "\u{13219}",
    note: "The pool sign represents the 'sh' sound, which existed as a single consonant in Egyptian.",
  },
  {
    input: "ch",
    gardiner: "V13",
    transliteration: "ṯ",
    signName: "Tethering rope",
    glyph: "\u{133FF}",
    note: "English 'ch' (as in 'church') is closest to the Egyptian ṯ, written with the tethering rope.",
  },
  {
    input: "kh",
    gardiner: "Aa1",
    transliteration: "ḫ",
    signName: "Placenta",
    glyph: "\u{1340D}",
    note: "'Kh' is the Egyptian ḫ, a guttural sound like Scottish 'loch', written with the placenta (sieve) sign.",
  },
  {
    input: "th",
    gardiner: "X1",
    transliteration: "t",
    signName: "Bread loaf",
    glyph: "\u{133CF}",
    note: "Egyptian had no 'th' fricative. It is simplified to 't', represented by the bread loaf sign.",
  },
  {
    input: "ph",
    gardiner: "I9",
    transliteration: "f",
    signName: "Horned viper",
    glyph: "\u{13191}",
    note: "The 'ph' sound is equivalent to 'f', represented by the horned viper.",
  },
];

const LETTER_MAPPINGS: Record<string, HieroglyphMapping> = {
  a: {
    input: "a",
    gardiner: "G1",
    transliteration: "ꜣ",
    signName: "Vulture",
    glyph: "\u{1313F}",
    note: "The vulture represents the Egyptian 'aleph' (ꜣ), a glottal stop that is the closest equivalent to our vowel 'a'. Egyptian had no true vowel signs.",
  },
  b: {
    input: "b",
    gardiner: "D58",
    transliteration: "b",
    signName: "Foot",
    glyph: "\u{130C0}",
    note: "The foot sign represents 'b', a direct sound match between English and Egyptian.",
  },
  c: {
    input: "c",
    gardiner: "V31",
    transliteration: "k",
    signName: "Basket with handle",
    glyph: "\u{133A1}",
    note: "Hard 'c' (as in 'cat') maps to the Egyptian 'k', shown as a basket with handle.",
  },
  d: {
    input: "d",
    gardiner: "D46",
    transliteration: "d",
    signName: "Hand",
    glyph: "\u{130A7}",
    note: "The hand sign represents 'd', a direct sound match.",
  },
  e: {
    input: "e",
    gardiner: "M17",
    transliteration: "j",
    signName: "Reed",
    glyph: "\u{131CB}",
    note: "Egyptian had no vowels. The reed sign (j/y) is a semi-vowel used to approximate 'e' and 'i' sounds.",
  },
  f: {
    input: "f",
    gardiner: "I9",
    transliteration: "f",
    signName: "Horned viper",
    glyph: "\u{13191}",
    note: "The horned viper represents 'f', a direct sound match.",
  },
  g: {
    input: "g",
    gardiner: "W11",
    transliteration: "g",
    signName: "Jar stand",
    glyph: "\u{133BC}",
    note: "The jar stand represents a hard 'g' sound.",
  },
  h: {
    input: "h",
    gardiner: "O4",
    transliteration: "h",
    signName: "Reed shelter",
    glyph: "\u{13254}",
    note: "The reed shelter represents 'h', a direct sound match.",
  },
  i: {
    input: "i",
    gardiner: "M17",
    transliteration: "j",
    signName: "Reed",
    glyph: "\u{131CB}",
    note: "Egyptian had no vowels. The reed sign (j/y) is a semi-vowel used to approximate 'i' and 'e' sounds.",
  },
  j: {
    input: "j",
    gardiner: "I10",
    transliteration: "ḏ",
    signName: "Cobra",
    glyph: "\u{13193}",
    note: "The letter 'j' maps to the Egyptian 'ḏ' (a 'dj' sound), represented by the cobra.",
  },
  k: {
    input: "k",
    gardiner: "V31",
    transliteration: "k",
    signName: "Basket with handle",
    glyph: "\u{133A1}",
    note: "The basket with handle represents 'k', a direct sound match.",
  },
  l: {
    input: "l",
    gardiner: "D21",
    transliteration: "r",
    signName: "Mouth",
    glyph: "\u{1308B}",
    note: "Classical Egyptian had no separate sign for 'l': scribes wrote it with the mouth (r). Much later, the lion 𓃭 was used for L in Greek names such as Cleopatra.",
  },
  m: {
    input: "m",
    gardiner: "G17",
    transliteration: "m",
    signName: "Owl",
    glyph: "\u{13153}",
    note: "The owl represents 'm', a direct sound match. The owl is one of the most recognisable hieroglyphs.",
  },
  n: {
    input: "n",
    gardiner: "N35",
    transliteration: "n",
    signName: "Water ripple",
    glyph: "\u{13216}",
    note: "The water ripple represents 'n', a direct sound match.",
  },
  o: {
    input: "o",
    gardiner: "G43",
    transliteration: "w",
    signName: "Quail chick",
    glyph: "\u{13171}",
    note: "Egyptian had no vowels. The quail chick (w) is a semi-vowel used to approximate rounded vowels 'o' and 'u'.",
  },
  p: {
    input: "p",
    gardiner: "Q3",
    transliteration: "p",
    signName: "Stool",
    glyph: "\u{132AA}",
    note: "The stool/mat sign represents 'p', a direct sound match.",
  },
  q: {
    input: "q",
    gardiner: "N29",
    transliteration: "q",
    signName: "Hill slope",
    glyph: "\u{1320E}",
    note: "The hill slope represents 'q', an emphatic 'k' sound in Egyptian.",
  },
  r: {
    input: "r",
    gardiner: "D21",
    transliteration: "r",
    signName: "Mouth",
    glyph: "\u{1308B}",
    note: "The mouth sign represents 'r', and also 'l', which had no sign of its own in classical Egyptian.",
  },
  s: {
    input: "s",
    gardiner: "S29",
    transliteration: "s",
    signName: "Folded cloth",
    glyph: "\u{132F4}",
    note: "The folded cloth represents 's', a direct sound match.",
  },
  t: {
    input: "t",
    gardiner: "X1",
    transliteration: "t",
    signName: "Bread loaf",
    glyph: "\u{133CF}",
    note: "The bread loaf represents 't', a direct sound match. Bread was central to Egyptian life and offerings.",
  },
  u: {
    input: "u",
    gardiner: "G43",
    transliteration: "w",
    signName: "Quail chick",
    glyph: "\u{13171}",
    note: "Egyptian had no vowels. The quail chick (w) is a semi-vowel used to approximate 'u' and 'o' sounds.",
  },
  v: {
    input: "v",
    gardiner: "I9",
    transliteration: "f",
    signName: "Horned viper",
    glyph: "\u{13191}",
    note: "Egyptian had no 'v' sound. The closest equivalent is 'f', represented by the horned viper.",
  },
  w: {
    input: "w",
    gardiner: "G43",
    transliteration: "w",
    signName: "Quail chick",
    glyph: "\u{13171}",
    note: "The quail chick represents 'w', a direct sound match.",
  },
  x: {
    input: "x",
    gardiner: "V31+S29",
    transliteration: "ks",
    signName: "Basket + Folded cloth",
    glyph: "\u{133A1}\u{132F4}",
    note: "The letter 'x' does not exist in Egyptian. It is decomposed into its component sounds: 'k' (basket) + 's' (folded cloth).",
  },
  y: {
    input: "y",
    gardiner: "M17",
    transliteration: "j",
    signName: "Reed",
    glyph: "\u{131CB}",
    note: "The letter 'y' maps to the reed sign (j/y), which was a semi-vowel in Egyptian.",
  },
  z: {
    input: "z",
    gardiner: "O34",
    transliteration: "z",
    signName: "Door bolt",
    glyph: "\u{13283}",
    note: "The door bolt wrote z. By the Middle Kingdom it sounded like s, so scribes used it and the folded cloth for the same sound.",
  },
};

/**
 * Every mapping the translator knows, digraphs first then a–z. Used by the
 * printable classroom worksheet so its alphabet chart can never drift from
 * what the translator renders.
 */
export function getAlphabetMappings(): HieroglyphMapping[] {
  return [...DIGRAPH_MAPPINGS, ...Object.values(LETTER_MAPPINGS)];
}

/**
 * Detect if 'c' before e/i/y should be soft (= s) rather than hard (= k).
 */
function isSoftC(name: string, index: number): boolean {
  const next = name[index + 1]?.toLowerCase();
  return next === "e" || next === "i" || next === "y";
}

/**
 * Lower-case a name and fold it to plain a–z so accented names keep their letters ("José" → "jose", not "jos").
 * ß, æ, œ and ç become the letters they sound like; ñ becomes "ny", except in Spanish, where the spelling rules
 * keep it whole. Anything that isn't a letter is dropped.
 */
export function normaliseName(name: string, locale: TranslatorLocale = "en"): string {
  let s = name.toLowerCase().replace(/[0-9]/g, "").replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/œ/g, "oe").replace(/ç/g, "s");
  // ñ stays whole for the Spanish rules (a placeholder survives the accent strip); everywhere else it is "ny"
  s = locale === "es" ? s.replace(/ñ/g, "0") : s.replace(/ñ/g, "ny");
  s = s.normalize("NFD").replace(/\p{M}/gu, "");
  s = s.replace(/[^a-z0]/g, "");
  return locale === "es" ? s.replace(/0/g, "ñ") : s;
}

/** The sign a spelling rule writes: a letter of the table, an English digraph, or one of the two-sign pairs. */
function signFor(key: string): HieroglyphMapping {
  if (key === "ny") return pair("ny", LETTER_MAPPINGS.n, LETTER_MAPPINGS.y);
  if (key === "wa") return pair("wa", LETTER_MAPPINGS.w, LETTER_MAPPINGS.a);
  return LETTER_MAPPINGS[key] ?? DIGRAPH_MAPPINGS.find((d) => d.input === key)!;
}

/** Two signs written for one sound, the way x is written k + s. */
function pair(input: string, a: HieroglyphMapping, b: HieroglyphMapping): HieroglyphMapping {
  return {
    input,
    gardiner: `${a.gardiner}+${b.gardiner}`,
    transliteration: `${a.transliteration}${b.transliteration}`,
    signName: `${a.signName} + ${b.signName}`,
    glyph: a.glyph + b.glyph,
    note: "",
  };
}

/** A mapping with its sign name and note in the page's language. */
function localise(m: HieroglyphMapping, locale: IntlLocale, note: string | undefined, letter: string): HieroglyphMapping {
  return {
    ...m,
    // two-sign pairs (x, ñ, oi…) are named half by half
    signName: m.gardiner
      .split("+")
      .map((code, i) => SIGN_NAMES[locale][code] ?? m.signName.split(" + ")[i] ?? m.signName)
      .join(" + "),
    note: note || LETTER_NOTES[locale][letter] || m.note,
  };
}

/**
 * Transliterate a name into hieroglyphic mappings.
 *
 * Process:
 * 1. Fold accents and odd letters to a–z (normaliseName)
 * 2. In Spanish and French, apply that language's spelling-by-sound rules first (silent letters write nothing)
 * 3. Check for digraphs (sh, ch, th, ph)
 * 4. Skip duplicate consecutive consonants (e.g., "rr" → one "r")
 * 5. Handle soft/hard C based on following vowel
 * 6. Map each remaining letter to its uniliteral sign
 *
 * `locale` only changes how letters are read: "en" (the default) spells English sounds, "es" and "fr" spell
 * Spanish and French sounds and give each sign's name and note in that language.
 */
export function transliterateName(name: string, locale: TranslatorLocale = "en"): TransliterationResult[] {
  const results: TransliterationResult[] = [];
  let lower: string;
  if (locale === "fr") {
    // silent endings are decided before accents go, so Chloé keeps its é and Inès its s
    const folded = name.toLowerCase().replace(/[^\p{L}]/gu, "");
    lower = normaliseName(dropFrenchSilentEnding(folded), "fr");
  } else {
    lower = normaliseName(name, locale);
  }
  const rules = locale === "es" ? SPANISH_RULES : locale === "fr" ? FRENCH_RULES : [];
  const push = (input: string, mapping: HieroglyphMapping, note?: string, letter = input) =>
    results.push({ input, mapping: locale === "en" ? mapping : localise({ ...mapping, input }, locale, note, letter) });
  let i = 0;

  outer: while (i < lower.length) {
    for (const rule of rules) {
      const n = rule.match(lower, i);
      if (!n) continue;
      if (rule.sign) push(rule.label(lower, i, n), signFor(rule.sign), rule.note);
      i += n;
      continue outer;
    }

    // "ch" before r or l is a hard k: Chris, Christopher, Chloe
    if (lower.startsWith("ch", i) && (lower[i + 2] === "r" || lower[i + 2] === "l")) {
      push("ch", { ...LETTER_MAPPINGS["k"], input: "ch", note: "Before 'r' or 'l' (Chris, Chloe), 'ch' sounds like 'k', so it uses the basket with handle." });
      i += 2;
      continue;
    }

    // Check digraphs first
    if (i < lower.length - 1) {
      const pair = lower.slice(i, i + 2);
      const digraph = DIGRAPH_MAPPINGS.find((d) => d.input === pair);
      if (digraph) {
        push(pair, digraph);
        i += 2;
        continue;
      }
    }

    const char = lower[i];

    // Skip duplicate consecutive consonants
    if (
      i > 0 &&
      char === lower[i - 1] &&
      !"aeiou".includes(char)
    ) {
      i++;
      continue;
    }

    // Handle soft C (before e, i, y)
    if (char === "c" && isSoftC(lower, i)) {
      push(
        "c",
        {
          ...LETTER_MAPPINGS["s"],
          input: "c",
          note: "Soft 'c' (before e, i, or y) sounds like 's', so it uses the folded cloth sign.",
        },
        locale === "fr" ? "Le « c » doux (devant e, i ou y) se prononce « s » : l'étoffe pliée." : undefined
      );
      i++;
      continue;
    }

    const mapping = LETTER_MAPPINGS[char];
    if (mapping) {
      push(char, mapping);
    }
    i++;
  }

  return results;
}

/**
 * Get just the hieroglyphic string for a name.
 */
export function getHieroglyphs(name: string, locale: TranslatorLocale = "en"): string {
  return transliterateName(name, locale)
    .map((r) => r.mapping.glyph)
    .join("");
}

/**
 * The doubled consonants the English translator writes once ("Anna" → ["n"], "Harry" → ["r"]): the same rule as
 * transliterateName, which skips a consonant that repeats the one before it. For the note under the cartouche.
 */
export function doubledLetters(name: string): string[] {
  const lower = normaliseName(name, "en");
  const out: string[] = [];
  for (let i = 1; i < lower.length; i++) {
    const c = lower[i];
    if (c === lower[i - 1] && /[a-z]/.test(c) && !"aeiou".includes(c) && !out.includes(c)) out.push(c);
  }
  return out;
}

/**
 * Get the Egyptological transliteration for a name.
 * e.g., "Harry" → "h-ꜣ-r-j"
 */
export function getTransliteration(name: string, locale: TranslatorLocale = "en"): string {
  return transliterateName(name, locale)
    .map((r) => r.mapping.transliteration)
    .join("-");
}
