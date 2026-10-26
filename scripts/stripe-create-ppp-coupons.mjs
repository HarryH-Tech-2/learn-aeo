#!/usr/bin/env node
/**
 * Create the purchasing-power-parity coupons (src/lib/ppp.ts): one per
 * tier, fixed ids, percent off, duration "forever" so subscriptions keep
 * the discount. Idempotent: existing coupons are left alone.
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-ppp-coupons.mjs
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY in the environment.");
  process.exit(1);
}
const stripe = new Stripe(key);
const TIERS = [
  { id: "PPP_TIER_B", percent: 30, name: "Purchasing-power parity · 30% off" },
  { id: "PPP_TIER_C", percent: 50, name: "Purchasing-power parity · 50% off" },
  { id: "PPP_TIER_D", percent: 65, name: "Purchasing-power parity · 65% off" },
];

for (const t of TIERS) {
  try {
    const c = await stripe.coupons.retrieve(t.id);
    console.log(`${t.id} exists (${c.percent_off}% ${c.duration})`);
  } catch {
    const c = await stripe.coupons.create({ id: t.id, percent_off: t.percent, duration: "forever", name: t.name, metadata: { ppp: "1" } });
    console.log(`created ${c.id}: ${c.percent_off}% ${c.duration}`);
  }
}
