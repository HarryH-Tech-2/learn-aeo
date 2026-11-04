// How sure a learner says they are about each concept ("Got it" / "Not sure yet" on the concept card), kept in this
// browser only, and the order the end-of-lesson review deck shows them in. Pure helpers plus guarded storage access:
// storage can be missing or throw (private windows, blocked site data), and the lesson must work without it.

import { COOKIE_PREFIX } from "@/lib/site";

export type Confidence = "got" | "shaky";
export type ConfidenceMap = Record<string, Confidence>;

export function confidenceKey(lessonId: string): string {
  return `${COOKIE_PREFIX}confidence_${lessonId}`;
}

/** Only known values survive a corrupt or hand-edited entry. */
export function parseConfidence(raw: string | null): ConfidenceMap {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([, c]) => c === "got" || c === "shaky")) as ConfidenceMap;
  } catch {
    return {};
  }
}

export function readConfidence(lessonId: string): ConfidenceMap {
  try {
    return parseConfidence(window.localStorage.getItem(confidenceKey(lessonId)));
  } catch {
    return {};
  }
}

export function writeConfidence(lessonId: string, map: ConfidenceMap): void {
  try {
    window.localStorage.setItem(confidenceKey(lessonId), JSON.stringify(map));
  } catch {
    // storage unavailable: the ratings simply aren't remembered
  }
}

/** Review order: "not sure" first, then unrated, then "got it"; lesson order within each. */
export function reviewOrder<T extends { id: string }>(concepts: readonly T[], map: ConfidenceMap): T[] {
  const rank = (id: string) => (map[id] === "shaky" ? 0 : map[id] === "got" ? 2 : 1);
  return concepts
    .map((c, i) => ({ c, i }))
    .sort((a, b) => rank(a.c.id) - rank(b.c.id) || a.i - b.i)
    .map(({ c }) => c);
}

/** Which side of a before/after pair shows first, stable per concept so a reload doesn't reshuffle it. */
export function afterFirst(conceptId: string): boolean {
  // FNV-1a, reading a high bit: the low bit of a simple string hash barely varies between similar ids
  let h = 2166136261;
  for (const ch of conceptId) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 16) & 1) === 1;
}
