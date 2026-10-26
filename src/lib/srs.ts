/**
 * Spaced repetition for Fading Paint: SM-2 (SuperMemo 2), the algorithm
 * behind Anki's defaults, with a fade curve on top so the wall can show how
 * close each sign is to being forgotten.
 *
 * Pure functions over plain objects. Times are epoch milliseconds so the
 * same code runs in the browser (guest wall in localStorage) and on the
 * server (Prisma SignReview rows).
 */

export const DAY_MS = 86_400_000;

export type SignState = {
  glyph: string;
  /** SM-2 easiness factor, 1.3 … 2.5+ */
  ease: number;
  /** current inter-repetition interval in days */
  interval: number;
  /** consecutive correct recalls */
  reps: number;
  /** times the sign was forgotten */
  lapses: number;
  /** when it was last reviewed (or seeded) */
  lastReview: number;
  /** when it is next due */
  due: number;
};

/** SM-2 quality: 0–2 = failed, 3 = hard, 4 = good, 5 = easy. */
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export const MIN_EASE = 1.3;
export const SEED_INTERVAL_DAYS = 2;
export const INITIAL_EASE = 2.5;

/** A sign the learner has just met: fresh paint, due for a first look in two days. */
export function seedSign(glyph: string, now: number, intervalDays: number = SEED_INTERVAL_DAYS): SignState {
  return { glyph, ease: INITIAL_EASE, interval: intervalDays, reps: 0, lapses: 0, lastReview: now, due: now + intervalDays * DAY_MS };
}

/**
 * SM-2 update. Failing (q < 3) resets the repetition count and brings the
 * sign back tomorrow; passing grows the interval 1 → 6 → interval × ease.
 */
export function review(state: SignState, quality: Quality, now: number): SignState {
  const q = Math.max(0, Math.min(5, Math.round(quality))) as Quality;
  let { ease, interval, reps, lapses } = state;
  if (q < 3) {
    reps = 0;
    lapses += 1;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
  }
  ease = Math.max(MIN_EASE, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  ease = Math.round(ease * 100) / 100;
  return { ...state, ease, interval, reps, lapses, lastReview: now, due: now + interval * DAY_MS };
}

/**
 * How faded a sign looks, 0 (just painted) → 1 (past due). Linear over the
 * interval, then it keeps weathering for another interval before it is
 * fully gone, so an overdue sign is visibly worse than one due today.
 */
export function fadeLevel(state: SignState, now: number): number {
  const span = Math.max(1, state.due - state.lastReview);
  const elapsed = now - state.lastReview;
  const raw = elapsed / (span * 2);
  return Math.max(0, Math.min(1, raw));
}

export function isDue(state: SignState, now: number): boolean {
  return state.due <= now;
}

export function dueSigns(states: SignState[], now: number): SignState[] {
  return states.filter((s) => isDue(s, now)).sort((a, b) => a.due - b.due);
}

/** Days until due (negative when overdue), rounded. */
export function daysUntilDue(state: SignState, now: number): number {
  return Math.round((state.due - now) / DAY_MS);
}

/**
 * Bring a stored set up to date with the signs a learner should have on the
 * wall: add what is missing (fresh), keep the rest untouched.
 */
export function syncSigns(states: SignState[], glyphs: string[], now: number): SignState[] {
  const have = new Set(states.map((s) => s.glyph));
  const added = glyphs.filter((g) => !have.has(g)).map((g) => seedSign(g, now));
  return [...states, ...added];
}

/** Map an answer to an SM-2 grade: first-try correct is "good", second-try "hard", wrong is a lapse. */
export function qualityFor(correct: boolean, attempts: number, fastMs?: number): Quality {
  if (!correct) return 1;
  if (attempts <= 1) return fastMs !== undefined && fastMs < 3000 ? 5 : 4;
  return 3;
}

export function isSignState(x: unknown): x is SignState {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  return typeof s.glyph === "string" && ["ease", "interval", "reps", "lapses", "lastReview", "due"].every((k) => typeof s[k] === "number");
}

/** Summary for the dashboard / The Dig. */
export function wallSummary(states: SignState[], now: number): { total: number; due: number; fresh: number; weathered: number } {
  let due = 0;
  let fresh = 0;
  let weathered = 0;
  for (const s of states) {
    const f = fadeLevel(s, now);
    if (isDue(s, now)) due += 1;
    if (f < 0.25) fresh += 1;
    else if (f >= 0.5) weathered += 1;
  }
  return { total: states.length, due, fresh, weathered };
}
