/**
 * Checking a typed transliteration ("Type the transliteration" in the Site Report).
 *
 * Lesson data writes a sign's value with a label for reading ("ꜣ (aleph)", "št (100)") and
 * determinatives as "(det.)". Learners type only the sound, and most keyboards have no ꜣ ꜥ ḥ ḫ,
 * so the check takes the plain-keyboard spellings beginners' books use (3 or a for ꜣ, kh for ḫ…).
 */

/** The letters a keyboard lacks, for the on-screen key row: the letter and its name. */
export const SPECIAL_LETTERS: { char: string; name: string }[] = [
  { char: "ꜣ", name: "aleph" },
  { char: "ꞽ", name: "yod" },
  { char: "ꜥ", name: "ayin" },
  { char: "ḥ", name: "emphatic h" },
  { char: "ḫ", name: "kh, as in Scottish loch" },
  { char: "ẖ", name: "softer kh" },
  { char: "š", name: "sh" },
  { char: "ṯ", name: "tj, ch" },
  { char: "ḏ", name: "dj" },
];

// Each special letter and what may be typed for it. Plain h stands for ḥ only: ḫ and ẖ are
// different sounds, written kh or x.
const ALTERNATIVES: Record<string, string[]> = {
  "ꜣ": ["ꜣ", "3", "a"],
  "ꞽ": ["ꞽ", "j", "i"],
  "ỉ": ["ꞽ", "j", "i"],
  "ꜥ": ["ꜥ", "a", "'", "’", "‘", "`", "c"],
  "ḥ": ["ḥ", "h"],
  "ḫ": ["ḫ", "kh", "x"],
  "ẖ": ["ẖ", "kh", "x"],
  "š": ["š", "sh"],
  "ṯ": ["ṯ", "tj", "ch"],
  "ḏ": ["ḏ", "dj"],
  "ḳ": ["ḳ", "q"],
  "j": ["j", "ꞽ", "i"],
};

/**
 * The part of a stored transliteration a learner is asked to type: "ꜣ (aleph)" → "ꜣ",
 * "št (100)" → "št". Null when nothing is left to type ("(det.)", "(plural)"), so the
 * question is not asked for that sign.
 */
export function typedAnswer(stored: string): string | null {
  const bare = stored.replace(/\([^)]*\)/g, "").normalize("NFC").trim();
  return bare ? bare : null;
}

function clean(s: string): string {
  // ꞽ's capital and the dotted/combining forms fold in with NFC; spaces, dots and dashes are separators
  return s.normalize("NFC").toLowerCase().replace(/[\s.\-=]/g, "");
}

/** True when `typed` spells `expected`, letting each special letter be typed any of its ways. */
function spells(typed: string, expected: string): boolean {
  if (!expected) return typed === "";
  const ch = expected[0];
  const rest = expected.slice(1);
  for (const alt of ALTERNATIVES[ch] ?? [ch]) {
    if (typed.startsWith(alt) && spells(typed.slice(alt.length), rest)) return true;
  }
  return false;
}

/**
 * Grades a typed answer against the stored transliteration.
 * "exact": the Egyptological spelling. "close": a keyboard spelling of it (show the proper one).
 */
export function checkTransliteration(typed: string, stored: string): "exact" | "close" | "wrong" {
  const answer = typedAnswer(stored);
  if (!answer) return "wrong";
  // someone who copies the label too ("ꜥ (ayin)") has it right
  const t = clean(typedAnswer(typed) ?? "");
  const a = clean(answer);
  if (!t) return "wrong";
  if (t === a) return "exact";
  return spells(t, a) ? "close" : "wrong";
}
