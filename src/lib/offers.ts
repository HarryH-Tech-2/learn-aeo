/**
 * Time-limited discount offers, backed by Stripe promotion codes.
 *
 * Three triggers create an offer:
 *   - "section-complete"  — the learner finished a section of the free lesson (24 h)
 *   - "lesson-complete"   — the learner finished the free lesson (24 h)
 *   - "checkout-abandoned" — a Checkout Session expired unpaid (48 h)
 *   - "nurture"           — day 5 of the sign-up email sequence (60 h)
 *
 * One live offer per user: the code + expiry are stored on User and applied
 * automatically by /api/stripe/create-checkout, so the learner never has to
 * type it. Percent-off (not amount-off) so it works in USD and GBP alike.
 */
import { prisma } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

export const OFFER_COUPON_ID = "NEXT-CHAMBER-33";
export const OFFER_PERCENT_OFF = 33;

export type OfferSource = "section-complete" | "lesson-complete" | "checkout-abandoned" | "nurture";

export type Offer = {
  code: string;
  expiresAt: Date;
  source: OfferSource;
  percentOff: number;
  /** set by grantOffer when it handed back an offer the user already held, rather than making a new one */
  reused?: boolean;
};

const HOURS: Record<OfferSource, number> = {
  "section-complete": 24,
  "lesson-complete": 24,
  "checkout-abandoned": 48,
  "nurture": 60,
};

function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `SCRIBE-${s}`;
}

async function ensureCoupon(): Promise<void> {
  const stripe = getStripe();
  try {
    await stripe.coupons.retrieve(OFFER_COUPON_ID);
  } catch {
    await stripe.coupons.create({
      id: OFFER_COUPON_ID,
      percent_off: OFFER_PERCENT_OFF,
      duration: "once",
      name: "Next chamber offer",
    });
  }
}

export async function getActiveOffer(email: string): Promise<Offer | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { offerCode: true, offerExpiresAt: true, offerSource: true },
  });
  if (!user?.offerCode || !user.offerExpiresAt) return null;
  if (user.offerExpiresAt.getTime() <= Date.now()) return null;
  return {
    code: user.offerCode,
    expiresAt: user.offerExpiresAt,
    source: (user.offerSource as OfferSource) ?? "lesson-complete",
    percentOff: OFFER_PERCENT_OFF,
  };
}

/**
 * Grant an offer to a user. Returns the existing one if it is still live
 * (so a second trigger never shortens or duplicates it), or null if the
 * user has already paid / doesn't exist.
 */
export async function grantOffer(email: string, source: OfferSource): Promise<Offer | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  if ((await checkSubscription(email)).active) return null;

  const existing = await getActiveOffer(email);
  if (existing) return { ...existing, reused: true };

  const expiresAt = new Date(Date.now() + HOURS[source] * 3600 * 1000);
  await ensureCoupon();
  const code = randomCode();
  await getStripe().promotionCodes.create({
    coupon: OFFER_COUPON_ID,
    code,
    max_redemptions: 1,
    expires_at: Math.floor(expiresAt.getTime() / 1000),
    metadata: { email, source },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { offerCode: code, offerExpiresAt: expiresAt, offerSource: source },
  });

  return { code, expiresAt, source, percentOff: OFFER_PERCENT_OFF };
}

/** Stripe promotion-code object id for a live offer, or null. */
export async function promotionCodeIdFor(offer: Offer): Promise<string | null> {
  const list = await getStripe().promotionCodes.list({ code: offer.code, limit: 1 });
  const pc = list.data[0];
  if (!pc || !pc.active) return null;
  if (pc.expires_at && pc.expires_at * 1000 <= Date.now()) return null;
  return pc.id;
}
