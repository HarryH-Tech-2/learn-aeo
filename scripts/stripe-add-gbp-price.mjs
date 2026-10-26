#!/usr/bin/env node
/**
 * Add a GBP currency option to the lifetime-access Price so UK visitors
 * check out in pounds. Run once per Stripe mode (test + live):
 *
 *   STRIPE_SECRET_KEY=sk_live_... STRIPE_PRICE_ID=price_... node scripts/stripe-add-gbp-price.mjs
 *
 * Amounts must match src/lib/pricing.ts (GBP 15.99 = 1599 minor units). Superseded by stripe-create-plans.mjs.
 * Safe to re-run: it merges into any existing currency_options.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
if (!key || !priceId) {
  console.error("Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in the environment.");
  process.exit(1);
}
const stripe = new Stripe(key);
const before = await stripe.prices.retrieve(priceId, { expand: ["currency_options"] });
console.log(`Price ${priceId}: ${before.unit_amount} ${before.currency}; options:`, Object.keys(before.currency_options ?? {}));

// Only the new option is sent: the default (USD) currency stays as it is, and
// re-sending the expanded USD entry trips Stripe's unit_amount/decimal check.
const updated = await stripe.prices.update(priceId, {
  currency_options: { gbp: { unit_amount: 1599 } },
});
console.log("GBP option now:", updated.currency_options?.gbp);
