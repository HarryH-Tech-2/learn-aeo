#!/usr/bin/env node
/**
 * Read-only launch check for the Learn AEO Stripe account: statement descriptor, Lifetime product,
 * coupons (the completion offer limited to Lifetime), the webhook endpoint and its events, then the
 * price audit (scripts/stripe-audit-prices.mjs). Run once per mode:
 *
 *   node --env-file=.env.local scripts/stripe-check-launch.mjs                      (sandbox)
 *   node --env-file=<pulled production env> scripts/stripe-check-launch.mjs --live
 *
 * A live key is refused without --live (scripts/lib/stripe-key.mjs). Exits 1 on any problem.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { stripeFromEnv } from "./lib/stripe-key.mjs";
import { CANONICAL_SITE_URL } from "./lib/env-check.mjs";
import { COUPONS, checkStripeLaunch } from "./lib/stripe-launch-check.mjs";

const { stripe, mode } = stripeFromEnv();
console.log(`Stripe mode: ${mode}\n`);

const account = await stripe.accounts.retrieve();
const lifetime = (await stripe.products.search({ query: "metadata['plan']:'lifetime' AND active:'true'", limit: 1 })).data[0];
const coupons = [];
for (const c of COUPONS) {
  try {
    coupons.push(await stripe.coupons.retrieve(c.id, { expand: ["applies_to"] }));
  } catch {
    // missing: reported by the check
  }
}
const webhooks = (await stripe.webhookEndpoints.list({ limit: 100 })).data;

const problems = checkStripeLaunch({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || CANONICAL_SITE_URL,
  descriptor: account.settings?.payments?.statement_descriptor ?? null,
  lifetimeProductId: lifetime?.id ?? null,
  coupons,
  webhooks,
});
for (const p of problems) console.error(`✗ ${p}`);
if (!problems.length) console.log("✓ Descriptor, Lifetime product, coupons and webhook endpoint are ready.\n");

const audit = spawnSync(process.execPath, [fileURLToPath(new URL("./stripe-audit-prices.mjs", import.meta.url)), ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});
process.exit(problems.length || audit.status ? 1 : 0);
