/**
 * Guest play: the start of Lesson 1 without an account.
 *
 * Visitors who land on a blog post or the name translator almost never reach
 * the sign-up modal (0 sign-ups from ~300 such visitors in the 28 days to
 * 2026-09-19, against 60% of those who do see it). So those pages carry a
 * banner (GuestPlayBanner) that opens Lesson 1 with ?play=1, and the lesson
 * page lets them in instead of showing the sign-up wall. Until 1 Oct 2026 that
 * was level 1 of the Causeway game (account asked for on its finish card);
 * since then it is the written lesson: the door with their name and its
 * quick check, then a sign-up modal that cannot be closed, and back to the
 * first word afterwards (?at=words&name=). *
 * The homepage keeps the wall, which makes it the comparison. Nothing here is
 * a secret: anyone with the link can play level 1, which is free anyway; going
 * past it still needs an account (and levels 2+ the paid course).
 *
 * GA4 events, in order: guest_play_banner_view → guest_play_banner_click {location, question_type} → guest_play_start
 * → guest_level_complete → guest_signup_prompt → sign_up.
 */
import { COOKIE_PREFIX } from "@/lib/site";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

export const GUEST_PLAY_PARAM = "play";
const KEY = `${COOKIE_PREFIX}guest_play`;
const LESSON = FIRST_LESSON_PATH;

/** Where the banner points. A name typed into the translator rides along and is offered in the game's name box. */
export function guestPlayHref(name?: string): string {
  const clean = (name ?? "").trim().slice(0, 30);
  return `${LESSON}?${GUEST_PLAY_PARAM}=1${clean ? `&name=${encodeURIComponent(clean)}` : ""}`;
}

/** Arrived by the banner now, or on an earlier visit from this browser (so a refresh is not met with the wall). */
export function guestPlayAllowed(params: { get(name: string): string | null }): boolean {
  const asked = params.get(GUEST_PLAY_PARAM) === "1";
  try {
    if (asked) localStorage.setItem(KEY, "1");
    return asked || localStorage.getItem(KEY) === "1";
  } catch {
    return asked;
  }
}
