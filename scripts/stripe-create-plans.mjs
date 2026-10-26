#!/usr/bin/env node
/**
 * Create the plan catalogue in the Learn AEO Stripe account (src/lib/plans.ts): one Product and one Price per
 * plan, USD default with a GBP currency option, statement descriptor LEARNAEO. Prints the environment
 * variables to set. Run once per Stripe mode:
 *
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-plans.mjs
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-create-plans.mjs --live
 *
 * A live key is refused without --live (scripts/lib/stripe-key.mjs).
 *
 * Idempotent: products are looked up by metadata.plan and reused; a new
 * Price is only created when no active Price matches the amounts.
 */
import { stripeFromEnv } from "./lib/stripe-key.mjs";

const { stripe, mode } = stripeFromEnv();

const STATEMENT_DESCRIPTOR = "LEARNAEO";

// Keep in sync with src/lib/plans.ts (amounts in minor units).
const PLANS = [
  { id: "lifetime", name: "Learn AEO — Lifetime", description: "The full answer engine optimisation course: every lesson as it's released, tools, templates and certificate. One payment.", usd: 10000, gbp: 8000, recurring: null, envKey: "STRIPE_PRICE_ID" },
  { id: "monthly", name: "Learn AEO — Monthly", description: "The full answer engine optimisation course, month by month. Cancel any time.", usd: 1000, gbp: 800, recurring: { interval: "month" }, envKey: "STRIPE_PRICE_MONTHLY" },
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

/** 10000 → "100", 6699 → "66.99" */
const money = (minor) => (minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2));

console.log(`Stripe mode: ${mode}\n`);
const env = [];
for (const plan of PLANS) {
  let product = await findProduct(plan.id);
  if (!product) {
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      statement_descriptor: STATEMENT_DESCRIPTOR,
      metadata: { plan: plan.id },
    });
    console.log(`created product ${product.id} (${plan.id})`);
  } else {
    console.log(`product ${product.id} (${plan.id}) exists`);
    if (product.name !== plan.name || product.statement_descriptor !== STATEMENT_DESCRIPTOR) {
      product = await stripe.products.update(product.id, { name: plan.name, description: plan.description, statement_descriptor: STATEMENT_DESCRIPTOR });
      console.log("  updated name / statement descriptor");
    }
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
    console.log(`  created price ${price.id}: $${money(plan.usd)} / £${money(plan.gbp)}${plan.recurring ? ` per ${plan.recurring.interval}` : ""}`);
  } else {
    console.log(`  price ${price.id} matches`);
  }
  env.push(`${plan.envKey}=${price.id}`);
}

console.log(`\nSet these (${mode}):\n${env.join("\n")}`);
