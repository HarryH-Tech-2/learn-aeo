#!/usr/bin/env node
/**
 * Create the Learn AEO Stripe coupons:
 *   - purchasing-power parity (src/lib/ppp.ts): AEO_PPP_B / C / D at 30 / 50 / 65% off, duration "forever" so
 *     the monthly subscription keeps the discount;
 *   - the completion offer (src/lib/offers.ts): NEXT-DISTRICT-33, 33% off once. The site attaches it to
 *     Lifetime checkouts only, through single-use AEO- promotion codes.
 * Idempotent: existing coupons are left alone (a mismatch is reported, not changed).
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-ppp-coupons.mjs
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-create-ppp-coupons.mjs --live
 *
 * A live key is refused without --live (scripts/lib/stripe-key.mjs).
 */
import { stripeFromEnv } from "./lib/stripe-key.mjs";

const { stripe, mode } = stripeFromEnv();

// Keep in sync with src/lib/ppp.ts (PPP_COUPON_ID, PPP_PERCENT) and src/lib/offers.ts (OFFER_COUPON_ID).
const COUPONS = [
  { id: "AEO_PPP_B", percent: 30, duration: "forever", name: "Purchasing-power parity · 30% off", metadata: { ppp: "1" } },
  { id: "AEO_PPP_C", percent: 50, duration: "forever", name: "Purchasing-power parity · 50% off", metadata: { ppp: "1" } },
  { id: "AEO_PPP_D", percent: 65, duration: "forever", name: "Purchasing-power parity · 65% off", metadata: { ppp: "1" } },
  { id: "NEXT-DISTRICT-33", percent: 33, duration: "once", name: "Learn AEO offer · 33% off", metadata: { offer: "1" } },
];

console.log(`Stripe mode: ${mode}\n`);
for (const t of COUPONS) {
  try {
    const c = await stripe.coupons.retrieve(t.id);
    const same = c.percent_off === t.percent && c.duration === t.duration;
    console.log(`${t.id} exists (${c.percent_off}% ${c.duration})${same ? "" : `  MISMATCH: expected ${t.percent}% ${t.duration}`}`);
  } catch {
    const c = await stripe.coupons.create({ id: t.id, percent_off: t.percent, duration: t.duration, name: t.name, metadata: t.metadata });
    console.log(`created ${c.id}: ${c.percent_off}% ${c.duration}`);
  }
}
