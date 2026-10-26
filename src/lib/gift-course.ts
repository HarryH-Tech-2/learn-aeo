/**
 * Gift the course (2026-10-19): someone buys lifetime access for someone else. Stripe Checkout takes the money
 * (metadata.product "gift-course", the recipient's and giver's names); the buyer gets a gift link and a certificate
 * (the recipient's name in a cartouche on the keyboard card, template "gift"); the recipient opens the link, signs in
 * and the course unlocks.
 *
 * No database table: the gift code is the checkout session id plus an HMAC of it, and redemption is written onto
 * the payment's PaymentIntent metadata (redeemed_email, redeemed_at), so a code works once and a refund can find
 * who to take access back from (src/lib/refunds.ts). Signing lives in src/lib/gift-code.ts (server only).
 */
import { PLANS } from "@/lib/plans";
import { cleanName, isGiftSeason, keyboardImagePath, type KeyboardStyleId } from "@/lib/keyboard-card";

export const GIFT_COURSE = {
  id: "gift-course",
  name: "Learn Hieroglyphics, lifetime access (gift)",
  description: "Lifetime access to the full hieroglyphics course for someone else, with a gift certificate in their name.",
  usd: PLANS.lifetime.usd,
  gbp: PLANS.lifetime.gbp,
} as const;

export const GIFT_PATH = "/gift";
export const GIFT_THANKS_PATH = "/gift/thanks";
export const GIFT_REDEEM_PATH = "/gift/redeem";

/** Names on a gift: the same rules as a name on the card, kept short enough for the certificate. */
export function cleanGiftName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/[^\p{L}\p{M}' -]/gu, "").replace(/\s+/g, " ").trim().slice(0, 30);
}

export function giftRedeemPath(code: string): string {
  return `${GIFT_REDEEM_PATH}?code=${encodeURIComponent(code)}`;
}

/** The certificate's background: Christmas from November to Christmas Day, the pyramids the rest of the year. */
export function certificateStyle(now: Date = new Date()): KeyboardStyleId {
  return isGiftSeason(now) ? "christmas" : "pyramids";
}

/** The certificate picture: "A Gift for", the recipient's name in a cartouche, the note and "From …". */
export function certificateImagePath(recipient: string, now: Date = new Date(), from = ""): string {
  return keyboardImagePath({ typed: cleanName(recipient), style: certificateStyle(now), template: "gift", spell: "name", from });
}

export type GiftMetadata = { recipient: string; from: string };

/** What a checkout session says about its gift; null when it is not a gift session. */
export function giftFromSession(session: { metadata?: Record<string, string> | null }): GiftMetadata | null {
  const md = session.metadata ?? {};
  if (md.product !== GIFT_COURSE.id) return null;
  return { recipient: cleanGiftName(md.recipient), from: cleanGiftName(md.from) };
}
