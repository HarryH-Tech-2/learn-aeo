/**
 * Lesson 1 finished as the causeway game, kept on this device until an account can be told.
 *
 * The game is played by guests as well as members, and only a member's progress can be saved. So a
 * win is noted here first, then reported once, to the first account signed in on this device: straight
 * away for someone signed in, or when a guest who finished comes back signed in. Reporting it opens the same things finishing the
 * written lesson does (the completed lesson, the next-chamber offer and its email).
 */
const DONE_KEY = "lh:causeway:l1done";
const SENT_KEY = "lh:causeway:l1sent";

function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** `signs`: how many signs were placed on the gate (all of them, by the time it opens) */
export function rememberGameLessonDone(signs: number): void {
  try {
    store()?.setItem(DONE_KEY, String(Math.max(1, Math.round(signs))));
  } catch {
    // (private windows can refuse; the signed-in report still goes)
  }
}

/** The signs placed, once, for the first account to see a finish on this device (then marked reported); else null. */
export function takeGameLessonDone(userId: string): number | null {
  const s = store();
  if (!s || !userId) return null;
  try {
    const signs = Number(s.getItem(DONE_KEY));
    if (!(signs > 0) || s.getItem(SENT_KEY)) return null;
    s.setItem(SENT_KEY, userId);
    return signs;
  } catch {
    return null;
  }
}
