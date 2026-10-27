// Pure helpers for lesson questions: checking answers, deterministic shuffling,
// and the reorder/match interactions. Answers are always checked against the
// original (unshuffled) indices, so display order never affects marking.

import type { Question } from "./lesson-types";

export type QuestionResponse =
  | { kind: "choice"; index: number }
  | { kind: "passage"; index: 0 | 1 }
  | { kind: "blank"; fills: string[] }
  | { kind: "order"; order: string[] }
  | { kind: "match"; pairs: Record<string, string> /* term to definition */ }
  | { kind: "spot"; line: number };

const norm = (s: string) => s.trim().toLowerCase();

export function checkAnswer(q: Question, r: QuestionResponse): boolean {
  if (q.kind !== r.kind) return false;
  switch (q.kind) {
    case "choice":
      return r.kind === "choice" && r.index === q.answer;
    case "passage":
      return r.kind === "passage" && r.index === q.answer;
    case "blank":
      return (
        r.kind === "blank" &&
        r.fills.length === q.answers.length &&
        q.answers.every((a, i) => norm(a) === norm(r.fills[i]))
      );
    case "order":
      return r.kind === "order" && r.order.length === q.items.length && q.items.every((it, i) => it === r.order[i]);
    case "match":
      return r.kind === "match" && q.pairs.every((p) => r.pairs[p.term] === p.definition);
    case "spot":
      return r.kind === "spot" && r.line === q.answer;
  }
}

/** Stable 32-bit FNV-1a hash of a string. */
export function seedFrom(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic permutation: the same seed always gives the same order. */
export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Move one item a step up (-1) or down (1). A no-op at either end. */
export function moveItem<T>(items: readonly T[], from: number, dir: -1 | 1): T[] {
  const to = from + dir;
  const out = [...items];
  if (from < 0 || from >= out.length || to < 0 || to >= out.length) return out;
  [out[from], out[to]] = [out[to], out[from]];
  return out;
}

/** Pair a term with a definition. A definition already used elsewhere moves. */
export function pairUp(pairs: Record<string, string>, term: string, definition: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [t, d] of Object.entries(pairs)) {
    if (d !== definition && t !== term) out[t] = d;
  }
  out[term] = definition;
  return out;
}

export function blankCount(text: string): number {
  return text.split("___").length - 1;
}
