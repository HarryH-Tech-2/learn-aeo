/**
 * Rules for the unprompted sign-up nudge (AuthPromptCard).
 *
 * The card is only ever triggered by an intent signal, never a timer:
 *   - blog_scroll:          the reader is ~two-thirds through an article
 *   - translator_complete:  they downloaded, shared or emailed their cartouche
 *
 * Everything here is pure so the guard rules can be unit-tested; the hook in
 * src/components/useAuthPrompt.ts wires it to the browser.
 */

export type PromptTrigger = "blog_scroll" | "translator_complete";

/** localStorage key holding the last time the card was shown to this browser. */
export const PROMPT_STORAGE_KEY = "lh_auth_prompt";
/** Once shown (whatever the outcome) the card stays away for this long. */
export const PROMPT_SUPPRESS_MS = 30 * 24 * 60 * 60 * 1000;
/** Never interrupt someone who has only just arrived, whatever they do. */
export const PROMPT_MIN_TIME_ON_PAGE_MS = 10_000;
/** Fraction of the article body scrolled past before the blog card may appear. */
export const BLOG_SCROLL_THRESHOLD = 0.65;
/** Breathing room after a download/share before the translator card slides in. */
export const TRANSLATOR_PROMPT_DELAY_MS = 1_500;

export type PromptRecord = { shownAt: number };

export function parsePromptRecord(raw: string | null): PromptRecord | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { shownAt?: unknown };
    return typeof v?.shownAt === "number" && Number.isFinite(v.shownAt) ? { shownAt: v.shownAt } : null;
  } catch {
    return null;
  }
}

export function serialisePromptRecord(record: PromptRecord): string {
  return JSON.stringify(record);
}

export type PromptGuardInput = {
  signedIn: boolean;
  record: PromptRecord | null;
  now: number;
  pageLoadedAt: number;
  /** An input/textarea/contenteditable currently has focus. */
  inputFocused: boolean;
  /** The visitor already opened the sign-up/sign-in modal themselves this page view. */
  authModalUsed: boolean;
};

/**
 * Why the card may not show right now. "too_soon" and "typing" are temporary
 * (the caller should retry later); the others are final for this page view.
 */
export type PromptBlockReason = "none" | "signed_in" | "modal_used" | "recently_shown" | "typing" | "too_soon";

export function promptBlockReason(input: PromptGuardInput): PromptBlockReason {
  if (input.signedIn) return "signed_in";
  if (input.authModalUsed) return "modal_used";
  if (input.record) {
    // A future timestamp means a skewed clock; treat it as "just shown".
    const age = input.now - input.record.shownAt;
    if (age < PROMPT_SUPPRESS_MS) return "recently_shown";
  }
  if (input.inputFocused) return "typing";
  if (input.now - input.pageLoadedAt < PROMPT_MIN_TIME_ON_PAGE_MS) return "too_soon";
  return "none";
}

export function isTemporaryBlock(reason: PromptBlockReason): boolean {
  return reason === "typing" || reason === "too_soon";
}

export function shouldShowAuthPrompt(input: PromptGuardInput): boolean {
  return promptBlockReason(input) === "none";
}

/**
 * How far the bottom edge of the viewport has travelled through an element,
 * as a fraction 0..1. `top` is the element's offset from the document top.
 */
export function readingProgress(
  article: { top: number; height: number },
  scrollY: number,
  viewportHeight: number
): number {
  if (article.height <= 0) return 0;
  const viewportBottom = scrollY + viewportHeight;
  const into = viewportBottom - article.top;
  if (into <= 0) return 0;
  return Math.min(1, into / article.height);
}
