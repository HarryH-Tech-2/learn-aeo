import type { TransliterationResult } from "@/lib/hieroglyph-translator";

/**
 * The hand-off from the name translator to the free lesson. Lesson 1 opens
 * as the Causeway game, played without an account when the link carries
 * ?play=1 (src/lib/guest-play.ts); ?name= is offered in its name box. The
 * written lesson's sealed door still reads ?name= and ?signs=, so the link
 * carries all of them. Every translator CTA builds its link here so they agree.
 */

export const FREE_LESSON_PATH = "/lessons/expedition-begins";
export const ALPHABET_SIZE = 25;

/** Each distinct sign in the name, in first-seen order. */
export function distinctSigns(results: TransliterationResult[]): TransliterationResult[] {
  const seen = new Map<string, TransliterationResult>();
  for (const r of results) if (!seen.has(r.mapping.glyph)) seen.set(r.mapping.glyph, r);
  return [...seen.values()];
}

export function lessonHrefForName(name: string, results: TransliterationResult[]): string {
  const glyphs = distinctSigns(results).map((s) => s.mapping.glyph).join("");
  const params = new URLSearchParams();
  if (glyphs) params.set("signs", glyphs);
  const trimmed = name.trim();
  if (trimmed) params.set("name", trimmed);
  params.set("from", "translator");
  params.set("play", "1");
  // URLSearchParams writes spaces as "+", which the auth modal's return-URL
  // check rejects (src/components/AuthModal.tsx); "%20" passes and decodes
  // to a space in the lesson's NameGate.
  return `${FREE_LESSON_PATH}?${params.toString().replace(/\+/g, "%20")}`;
}
