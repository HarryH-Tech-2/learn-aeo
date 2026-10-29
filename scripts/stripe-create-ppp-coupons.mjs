#!/usr/bin/env node
/**
 * Create the Learn AEO Stripe coupons:
 *   - purchasing-power parity (src/lib/ppp.ts): AEO_PPP_B / C / D at 30 / 50 / 65% off, duration "forever" so
 *     the monthly subscription keeps the discount;
 *   - the completion offer (src/lib/offers.ts): NEXT-DISTRICT-33, 33% off once, limited in Stripe to the
 *     Lifetime product (so it can't discount Monthly even if a code leaks). The site attaches it to
 *     Lifetime checkouts only, through single-use AEO- promotion codes. Run stripe-create-plans.mjs first.
 * The coupon list lives in scripts/lib/stripe-launch-check.mjs, shared with stripe-check-launch.mjs.
 * Idempotent: existing coupons are left alone (a mismatch is reported, never changed or deleted).
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-ppp-coupons.mjs
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-create-ppp-coupons.mjs --live
 *
 * A live key is refused without --live (scripts/lib/stripe-key.mjs).
 */
import { stripeFromEnv } from "./lib/stripe-key.mjs";
import { COUPONS } from "./lib/stripe-launch-check.mjs";

const { stripe, mode } = stripeFromEnv();

const lifetime = (await stripe.products.search({ query: "metadata['plan']:'lifetime' AND active:'true'", limit: 1 })).data[0];

console.log(`Stripe mode: ${mode}
`);
for (const t of COUPONS) {
  if (t.lifetimeOnly && !lifetime) {
    console.error(`${t.id}: no Lifetime product yet. Run scripts/stripe-create-plans.mjs first.`);
    process.exitCode = 1;
    continue;
  }
  try {
    const c = await stripe.coupons.retrieve(t.id, { expand: ["applies_to"] });
    const same = c.percent_off === t.percent && c.duration === t.duration;
    const products = c.applies_to?.products ?? [];
    const scoped = !t.lifetimeOnly || (products.length === 1 && products[0] === lifetime.id);
    console.log(
      `${t.id} exists (${c.percent_off}% ${c.duration})` +
        (same ? "" : `  MISMATCH: expected ${t.percent}% ${t.duration}`) +
        (scoped ? "" : "  MISMATCH: not limited to Lifetime. Stripe can't edit that: delete it in the dashboard and re-run")
    );
  } catch {
    const c = await stripe.coupons.create({
      id: t.id,
      percent_off: t.percent,
      duration: t.duration,
      name: t.name,
      metadata: t.metadata,
      ...(t.lifetimeOnly ? { applies_to: { products: [lifetime.id] } } : {}),
    });
    console.log(`created ${c.id}: ${c.percent_off}% ${c.duration}${t.lifetimeOnly ? " (Lifetime only)" : ""}`);
  }
}
