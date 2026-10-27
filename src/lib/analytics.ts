/**
 * Thin GA4 event helper. gtag is loaded in src/app/layout.tsx; every event
 * automatically carries page_location, so lesson identity comes from the URL.
 *
 * Custom parameters must be registered as event-scoped custom dimensions in
 * GA4 (Admin → Custom definitions) to appear in reports:
 *   exercise, question_type, question, correct, score, total, pct, attempts
 *
 * Conversion events (mark these as Key events in GA4 → Admin → Events):
 *   sign_up          — account creation started on /get-started (method: google | email)
 *   login            — returning sign-in on /login (method)
 *   lesson_complete  — Site Report submitted at the end of a lesson (lesson_id, score, total)
 *   begin_checkout   — Stripe Checkout session requested (value, currency)
 *   purchase         — landed on /dashboard?checkout=success (transaction_id, value, currency)
 *
 * Funnel events added 2026-08-24:
 *   offer_shown / offer_click — discount offer rendered / claimed (offer_source, location). Never name a param
 *     "source", "medium" or "campaign": GA4 reads them as the traffic source and starts a new session with it
 *     (found 2026-10-16: "section-complete / (not set)" sessions).
 *
 * Funnel events added 2026-08-31 (hero/nav → first lesson → wall → sign-up):
 *   free_lesson_cta      — "First Lesson" CTA clicked (location: hero | nav | nav_mobile | blog)
 *   signup_wall_shown / signup_wall_click — guest hit / clicked the in-lesson sign-in wall (location)
 *   signup_modal_shown   — sign-up popup opened on the page (next: checkout | a path | dashboard)
 *   login_modal_shown    — sign-in popup opened (navbar / certificate "Sign In")
 *
 * Unprompted sign-up card added 2026-09-07 (src/components/AuthPromptCard.tsx):
 *   signup_prompt_shown / signup_prompt_click / signup_prompt_dismissed
 *     (trigger: blog_scroll). Shown at most once per
 *     browser per 30 days, never to signed-in users, never in the first 10 s.
 *
 * Lesson sections (2026-09-17):
 *   lesson_section_complete — a section's last quick check finished (lesson_id, section)
 *   lesson_section_continue — "Continue to section N" pressed on the break screen (lesson_id, section)
 *   lesson_section_resume   — returned later and picked up at a saved section (lesson_id, section)
 *   upgrade_panel_shown / upgrade_panel_click — upgrade screen at a section end or the outro
 *     (location: section_1 | section_2 | lesson_outro; offer: 0|1; target: checkout | pricing)
 *
 * Lesson player (2026-10-26, src/components/player/LessonPlayer.tsx):
 *   lesson_step           — a lesson step came on screen (lesson_id, step_kind: intro | concept | check | exercise | example | audit | outro)
 *   lesson_audit_complete — the final audit's last answer given (lesson_id, score, total, passed: 1 | 0)
 */

type Gtag = (...args: unknown[]) => void;

const MAX_QUESTION_LENGTH = 100;

/** Clip to at most `max` UTF-16 units without splitting a surrogate pair
 *  (emoji and other astral code points are 2 units each). */
function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  let out = "";
  for (const ch of s) {
    if (out.length + ch.length > max) break;
    out += ch;
  }
  return out;
}

/**
 * Tie a signed-in visitor's events to their account, so GA4 keeps one user across the
 * sign-in round trip (an email link opened in another browser, a second device). The id
 * is the opaque database id, never an email. gtag loads lazily: if it is not there yet,
 * the id waits on window.__lhUserId and the gtag-init script in layout.tsx sends it with
 * the config call.
 */
export function setAnalyticsUserId(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const w = window as unknown as { gtag?: Gtag; __lhUserId?: string };
  if (w.__lhUserId === id) return;
  w.__lhUserId = id;
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("set", { user_id: id });
  } catch {
    // Analytics must never break the page.
  }
}

/**
 * A GA4 user property (registered as a user-scoped custom dimension to report on). Like the user id, it waits on
 * window.__lhUserProps when gtag has not loaded yet; the gtag-init script in layout.tsx sends those with the config call.
 */
export function setAnalyticsUserProperty(name: string, value: string): void {
  if (typeof window === "undefined" || !name) return;
  const w = window as unknown as { gtag?: Gtag; __lhUserProps?: Record<string, string> };
  w.__lhUserProps = { ...(w.__lhUserProps ?? {}), [name]: value };
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("set", "user_properties", { [name]: value });
  } catch {
    // Analytics must never break the page.
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params);
  } catch {
    // Analytics must never break the lesson.
  }
}

/**
 * trackEvent for something seen as the page opens (a "_view" event fired on mount). gtag loads lazily after the
 * page (layout.tsx), so a mount-time trackEvent on a first page load is dropped, and the view count reads far lower
 * than the clicks that follow it. This waits for gtag, checking every half second for up to 20 s. Without consent
 * gtag never starts and nothing is sent, the same as for clicks. Returns a cancel function for effect cleanup.
 */
export function trackEventWhenReady(name: string, params: Record<string, unknown> = {}): () => void {
  if (typeof window === "undefined") return () => {};
  const ready = () => typeof (window as unknown as { gtag?: Gtag }).gtag === "function";
  if (ready()) {
    trackEvent(name, params);
    return () => {};
  }
  let tries = 0;
  const id = window.setInterval(() => {
    tries += 1;
    if (ready()) trackEvent(name, params);
    if (ready() || tries >= 40) window.clearInterval(id);
  }, 500);
  return () => window.clearInterval(id);
}

/**
 * Which part of a lesson a question belongs to, matching the player's step kinds
 * (src/lib/lesson-flow.ts): a quick check, the signature exercise or the final audit.
 */
export type ExerciseKind = "check" | "exercise" | "audit";

export function trackExerciseAnswer(input: {
  exercise: ExerciseKind;
  questionType: string;
  /** The prompt being asked about; clipped for GA4's param limits. */
  question: string;
  correct: boolean;
}): void {
  trackEvent("exercise_answer", {
    exercise: input.exercise,
    question_type: input.questionType,
    question: clip(input.question, MAX_QUESTION_LENGTH),
    correct: input.correct ? 1 : 0,
  });
}

export function trackExerciseComplete(input: {
  exercise: ExerciseKind;
  score: number;
  total: number;
  attempts?: number;
}): void {
  const pct = input.total > 0 ? Math.round((input.score / input.total) * 100) : 0;
  trackEvent("exercise_complete", {
    exercise: input.exercise,
    score: input.score,
    total: input.total,
    pct,
    ...(input.attempts !== undefined ? { attempts: input.attempts } : {}),
  });
}
