/**
 * "Send a friend their name" (2026-10-19): a visitor types a friend's name, and the link they send opens the name
 * translator already written out for that friend, with a line saying who sent it. Sending one unlocks the bonus
 * background (Abu Simbel, KEYBOARD_STYLES `bonus`) on this browser.
 *
 * Kept in localStorage, not an account: it is a thank-you, not a purchase, and a cleared browser simply asks for
 * one more friend. Nothing here touches the server.
 */
import { cartoucheSharePath, normaliseShareName } from "@/lib/share";

export const REFERRAL_UNLOCK_KEY = "lh_bonus_unlocked";
/** Fired on window when the bonus is unlocked, so every picker on the page opens it at once. */
export const REFERRAL_UNLOCK_EVENT = "lh:bonus-unlocked";

const BASE = "https://www.learnhieroglyphics.com";

/** The link a friend gets: their name, written out, and who sent it (first name only, cleaned like any shared name). */
export function friendLinkPath(friend: string, from?: string | null): string | null {
  const name = normaliseShareName(friend);
  if (!name) return null;
  const sender = from ? normaliseShareName(from) : null;
  const q = new URLSearchParams({ utm_source: "friend", utm_medium: "referral", utm_campaign: "send-a-friend" });
  if (sender) q.set("from", sender);
  return `${cartoucheSharePath(name)}?${q.toString()}`;
}

export function friendLink(friend: string, from?: string | null, origin: string = BASE): string | null {
  const path = friendLinkPath(friend, from);
  return path ? `${origin}${path}` : null;
}

/** Who sent this page, from ?from= (cleaned; null when absent or not a name). */
export function senderFrom(search: string): string | null {
  const raw = new URLSearchParams(search).get("from");
  return raw ? normaliseShareName(raw) : null;
}

export function isBonusUnlocked(): boolean {
  try {
    return window.localStorage.getItem(REFERRAL_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockBonus(): void {
  try {
    window.localStorage.setItem(REFERRAL_UNLOCK_KEY, "1");
  } catch {
    // private mode: the bonus still opens for this page view through the event
  }
  window.dispatchEvent(new Event(REFERRAL_UNLOCK_EVENT));
}
