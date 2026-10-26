#!/usr/bin/env node
/**
 * Check that every Stripe Price the site sells through matches the amounts
 * the site shows (src/lib/plans.ts, src/lib/cartouche-print.ts, mirrored in
 * scripts/stripe-create-plans.mjs). Reads the STRIPE_PRICE_* ids and the key
 * from the environment, so run it once per mode:
 *
 *   node --env-file=.env.local scripts/stripe-audit-prices.mjs        (sandbox)
 *   node --env-file=<pulled production env> scripts/stripe-audit-prices.mjs
 *
 * Exits 1 when any Price is missing, inactive or priced differently. Also
 * lists other active Prices on the same Products, which are harmless but
 * worth archiving so the dashboard shows one price per product.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY in the environment.");
  process.exit(1);
}
const stripe = new Stripe(key);
const mode = /^(sk|rk)_live/.test(key) ? "LIVE" : "test";

// The amounts the site shows, in minor units. Keep in sync with the two libs.
const EXPECTED = [
  { id: "lifetime", usd: 1999, gbp: 1599, interval: null, envKey: "STRIPE_PRICE_ID" },
  { id: "monthly", usd: 499, gbp: 399, interval: "month", envKey: "STRIPE_PRICE_MONTHLY" },
  { id: "classroom", usd: 2950, gbp: 2450, interval: "year", envKey: "STRIPE_PRICE_CLASSROOM" },
  { id: "school", usd: 12450, gbp: 9950, interval: "year", envKey: "STRIPE_PRICE_SCHOOL" },
  { id: "cartouche-print", usd: 1999, gbp: 1599, interval: null, envKey: "STRIPE_PRICE_CARTOUCHE" },
  { id: "cartouche-print-a4", usd: 3499, gbp: 2799, interval: null, envKey: "STRIPE_PRICE_CARTOUCHE_PRINT" },
  { id: "cartouche-print-framed", usd: 7999, gbp: 4999, interval: null, envKey: "STRIPE_PRICE_CARTOUCHE_FRAMED" },
];

const money = (minor) => (minor == null ? "—" : (minor / 100).toFixed(2));
let bad = 0;
console.log(`Stripe mode: ${mode}\n`);
for (const e of EXPECTED) {
  const id = process.env[e.envKey];
  const label = `${e.id.padEnd(22)} ${e.envKey}`;
  if (!id) {
    console.log(`MISSING  ${label}: env var not set (checkout falls back to inline price_data at the site's amounts)`);
    continue;
  }
  let price;
  try {
    price = await stripe.prices.retrieve(id, { expand: ["currency_options"] });
  } catch (err) {
    console.log(`ERROR    ${label}: ${id} → ${err.message}`);
    bad++;
    continue;
  }
  const usd = price.currency === "usd" ? price.unit_amount : null;
  const gbp = price.currency_options?.gbp?.unit_amount ?? null;
  const interval = price.recurring?.interval ?? null;
  const ok = price.active && usd === e.usd && gbp === e.gbp && interval === e.interval;
  console.log(
    `${ok ? "OK      " : "MISMATCH"} ${label}: ${id} $${money(usd)} / £${money(gbp)}${interval ? ` per ${interval}` : ""}${price.active ? "" : " (INACTIVE)"}` +
      (ok ? "" : `  expected $${money(e.usd)} / £${money(e.gbp)}${e.interval ? ` per ${e.interval}` : ""}`)
  );
  if (!ok) bad++;
  const siblings = await stripe.prices.list({ product: typeof price.product === "string" ? price.product : price.product.id, active: true, limit: 20 });
  for (const s of siblings.data.filter((p) => p.id !== id)) {
    console.log(`  note   another active price on the product: ${s.id} ${s.currency} ${money(s.unit_amount)}${s.recurring ? ` per ${s.recurring.interval}` : ""}`);
  }
}
console.log(bad ? `\n${bad} problem(s).` : "\nAll prices match the site.");
process.exit(bad ? 1 : 0);
