#!/usr/bin/env node
/**
 * Create the plan catalogue in Stripe (src/lib/plans.ts): one Product and
 * one Price per plan, USD default with a GBP currency option. Prints the
 * environment variables to set. Run once per Stripe mode:
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-plans.mjs
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-create-plans.mjs
 *
 * Idempotent: products are looked up by metadata.plan and reused; a new
 * Price is only created when no active Price matches the amounts.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY in the environment.");
  process.exit(1);
}
const stripe = new Stripe(key);
const mode = /^(sk|rk)_live/.test(key) ? "LIVE" : "test";

// Keep in sync with src/lib/plans.ts and src/lib/cartouche-print.ts
const PLANS = [
  { id: "lifetime", name: "Learn Hieroglyphics · Lifetime", description: "All eight chambers, every game, every future lesson. One payment.", usd: 1999, gbp: 1599, recurring: null, envKey: "STRIPE_PRICE_ID" },
  { id: "monthly", name: "Learn Hieroglyphics · Expedition Pass", description: "The full course, month by month. Cancel any time.", usd: 499, gbp: 399, recurring: { interval: "month" }, envKey: "STRIPE_PRICE_MONTHLY" },
  { id: "classroom", name: "Learn Hieroglyphics · Classroom licence", description: "One teacher and up to 30 pupils for a year, with pupil progress and Classroom mode.", usd: 2950, gbp: 2450, recurring: { interval: "year" }, envKey: "STRIPE_PRICE_CLASSROOM" },
  { id: "school", name: "Learn Hieroglyphics · School licence", description: "Unlimited pupils and teachers at one school for a year.", usd: 12450, gbp: 9950, recurring: { interval: "year" }, envKey: "STRIPE_PRICE_SCHOOL" },
  // Not a plan: a one-off digital good sold from the translator (src/lib/cartouche-print.ts).
  { id: "cartouche-print", name: "Cartouche Print · Digital PDF", description: "A print-ready A4 PDF of one name in a cartouche, with a sign-by-sign key and the story of the cartouche.", usd: 1999, gbp: 1599, recurring: null, envKey: "STRIPE_PRICE_CARTOUCHE" },
  { id: "cartouche-print-a4", name: "Cartouche Print · A4 print, posted", description: "One name in a cartouche, giclée on 200 gsm fine-art paper, printed and posted. The PDF included.", usd: 3499, gbp: 2799, recurring: null, envKey: "STRIPE_PRICE_CARTOUCHE_PRINT" },
  { id: "cartouche-print-framed", name: "Cartouche Print · Framed A4 print", description: "One name in a cartouche, printed and framed in black wood behind glass, posted ready to hang. The PDF included.", usd: 7999, gbp: 4999, recurring: null, envKey: "STRIPE_PRICE_CARTOUCHE_FRAMED" },
];

async function findProduct(planId) {
  const found = await stripe.products.search({ query: `metadata['plan']:'${planId}' AND active:'true'`, limit: 1 });
  return found.data[0] ?? null;
}

async function findPrice(productId, plan) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 20, expand: ["data.currency_options"] });
  return (
    prices.data.find((p) => {
      const sameUsd = p.currency === "usd" && p.unit_amount === plan.usd;
      const sameGbp = (p.currency_options?.gbp?.unit_amount ?? null) === plan.gbp;
      const sameInterval = plan.recurring ? p.recurring?.interval === plan.recurring.interval : !p.recurring;
      return sameUsd && sameGbp && sameInterval;
    }) ?? null
  );
}

console.log(`Stripe mode: ${mode}\n`);
const env = [];
for (const plan of PLANS) {
  let product = await findProduct(plan.id);
  if (!product) {
    product = await stripe.products.create({ name: plan.name, description: plan.description, metadata: { plan: plan.id } });
    console.log(`created product ${product.id} (${plan.id})`);
  } else {
    console.log(`product ${product.id} (${plan.id}) exists`);
  }

  let price = await findPrice(product.id, plan);
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: plan.usd,
      currency_options: { gbp: { unit_amount: plan.gbp } },
      ...(plan.recurring ? { recurring: plan.recurring } : {}),
      metadata: { plan: plan.id },
    });
    console.log(`  created price ${price.id}: $${(plan.usd / 100).toFixed(2)} / £${(plan.gbp / 100).toFixed(2)}${plan.recurring ? ` per ${plan.recurring.interval}` : ""}`);
  } else {
    console.log(`  price ${price.id} matches`);
  }
  env.push(`${plan.envKey}=${price.id}`);
}

console.log(`\nSet these (${mode}):\n${env.join("\n")}`);
