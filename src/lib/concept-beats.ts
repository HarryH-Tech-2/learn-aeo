// A concept card is shown a "beat" at a time instead of as one long page: the key idea, the explanation in
// short pieces, the quick question, why it matters, the example, the pitfall, then the wrap-up (confidence and
// sources). This module only decides the beats; ConceptCard draws them and LessonPlayer reveals them.

import type { Concept } from "./lesson-types";

export type Beat =
  | { kind: "idea"; markdown: string }
  | { kind: "explain"; markdown: string }
  | { kind: "quiz" }
  | { kind: "why" }
  | { kind: "example" }
  | { kind: "pitfall" }
  | { kind: "wrap" };

/** A beat of explanation holds at least this many words, so a short paragraph is not a tap of its own. */
const MIN_WORDS = 45;

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** True for a block that only makes sense under the one before it: a list, a table, a quote or a code fence. */
const continues = (block: string) => /^(\s*([-*+]|\d+[.)])\s|\||>|```)/.test(block);

/** Markdown split on blank lines, with a code fence kept whole. */
function blocks(markdown: string): string[] {
  const out: string[] = [];
  let open = false;
  for (const part of markdown.trim().split(/\n{2,}/)) {
    if (open) out[out.length - 1] += `\n\n${part}`;
    else out.push(part);
    if ((part.match(/```/g)?.length ?? 0) % 2 === 1) open = !open;
  }
  return out;
}

/** The explanation in pieces of roughly a paragraph: nothing is dropped or reordered. */
export function explanationChunks(markdown: string): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const block of blocks(markdown)) {
    if (current && words(current) >= MIN_WORDS && !continues(block)) {
      chunks.push(current);
      current = block;
    } else {
      current = current ? `${current}\n\n${block}` : block;
    }
  }
  if (current) {
    // a short tail joins the piece before it
    if (chunks.length > 0 && words(current) < MIN_WORDS / 2) chunks[chunks.length - 1] += `\n\n${current}`;
    else chunks.push(current);
  }
  return chunks;
}

export function conceptBeats(concept: Concept): Beat[] {
  const [first = "", ...rest] = explanationChunks(concept.explanation);
  const beats: Beat[] = [{ kind: "idea", markdown: first }, ...rest.map((markdown): Beat => ({ kind: "explain", markdown }))];
  if (concept.quiz) beats.push({ kind: "quiz" });
  beats.push({ kind: "why" });
  if (concept.example) beats.push({ kind: "example" });
  beats.push({ kind: "pitfall" }, { kind: "wrap" });
  return beats;
}
