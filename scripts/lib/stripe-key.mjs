/**
 * Shared Stripe key guard for the scripts/stripe-*.mjs tools. They write to (or read from) the Stripe account
 * named by STRIPE_SECRET_KEY, so a live key is refused unless the command line says --live: pasting the wrong
 * key must not create products or coupons in the live account by accident.
 *
 *   checkStripeKey(key, argv)  pure: { ok: true, mode } or { ok: false, error }
 *   stripeFromEnv()            the guarded client for a script: exits 1 with the error otherwise
 */
import Stripe from "stripe";

const LIVE = /^(sk|rk)_live_/;

/** @returns {{ ok: true, mode: "LIVE" | "test" } | { ok: false, error: string }} */
export function checkStripeKey(key, argv = []) {
  if (!key) return { ok: false, error: "Set STRIPE_SECRET_KEY in the environment." };
  if (LIVE.test(key)) {
    if (!argv.includes("--live")) {
      return { ok: false, error: "STRIPE_SECRET_KEY is a live key. Re-run with --live if you really mean to use the live Stripe account." };
    }
    return { ok: true, mode: "LIVE" };
  }
  return { ok: true, mode: "test" };
}

/** A Stripe client for STRIPE_SECRET_KEY, or exit 1 when the key is missing, or live without --live. */
export function stripeFromEnv() {
  const key = process.env.STRIPE_SECRET_KEY;
  const check = checkStripeKey(key, process.argv.slice(2));
  if (!check.ok) {
    console.error(check.error);
    process.exit(1);
  }
  return { stripe: new Stripe(key), mode: check.mode };
}
