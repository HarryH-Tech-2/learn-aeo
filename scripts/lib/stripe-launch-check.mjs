/**
 * What the Learn AEO Stripe account must look like at launch, as a pure check over a snapshot that
 * scripts/stripe-check-launch.mjs reads from the API. Plain JS so vitest can test it without Stripe.
 */

export const STATEMENT_DESCRIPTOR = "LEARNAEO";
export const OFFER_COUPON_ID = "NEXT-DISTRICT-33";

/** Keep in sync with src/lib/ppp.ts (PPP_COUPON_ID, PPP_PERCENT) and src/lib/offers.ts (OFFER_COUPON_ID). */
export const COUPONS = [
  { id: "AEO_PPP_B", percent: 30, duration: "forever", name: "Purchasing-power parity · 30% off", metadata: { ppp: "1" } },
  { id: "AEO_PPP_C", percent: 50, duration: "forever", name: "Purchasing-power parity · 50% off", metadata: { ppp: "1" } },
  { id: "AEO_PPP_D", percent: 65, duration: "forever", name: "Purchasing-power parity · 65% off", metadata: { ppp: "1" } },
  { id: OFFER_COUPON_ID, percent: 33, duration: "once", name: "Learn AEO offer · 33% off", metadata: { offer: "1" }, lifetimeOnly: true },
];

/** The events src/app/api/webhooks/stripe/route.ts handles (a test keeps the two in step). */
export const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
];

/**
 * @param {{
 *   siteUrl: string;
 *   descriptor: string | null;
 *   lifetimeProductId: string | null;
 *   coupons: { id: string; percent_off: number | null; duration: string; applies_to?: { products: string[] } }[];
 *   webhooks: { url: string; status: string; enabled_events: string[] }[];
 * }} s
 * @returns {string[]} problems; empty when the account is ready
 */
export function checkStripeLaunch(s) {
  const problems = [];
  if (s.descriptor !== STATEMENT_DESCRIPTOR) {
    problems.push(`Statement descriptor is ${JSON.stringify(s.descriptor)}; set it to ${STATEMENT_DESCRIPTOR} (Settings → Public details).`);
  }
  if (!s.lifetimeProductId) problems.push("No active Lifetime product (metadata.plan = lifetime): run scripts/stripe-create-plans.mjs.");

  for (const want of COUPONS) {
    const c = s.coupons.find((x) => x.id === want.id);
    if (!c) {
      problems.push(`Coupon ${want.id} is missing: run scripts/stripe-create-ppp-coupons.mjs.`);
      continue;
    }
    if (c.percent_off !== want.percent || c.duration !== want.duration) {
      problems.push(`Coupon ${want.id} is ${c.percent_off}% ${c.duration}; expected ${want.percent}% ${want.duration}.`);
    }
    if (want.lifetimeOnly && s.lifetimeProductId) {
      const products = c.applies_to?.products ?? [];
      if (products.length !== 1 || products[0] !== s.lifetimeProductId) {
        problems.push(`Coupon ${want.id} must be limited to the Lifetime product only. Stripe can't change that: delete it and re-run scripts/stripe-create-ppp-coupons.mjs.`);
      }
    }
  }

  const url = `${s.siteUrl}/api/webhooks/stripe`;
  const hook = s.webhooks.find((w) => w.url === url);
  if (!hook) problems.push(`No webhook endpoint for ${url}: add one in Developers → Webhooks.`);
  else if (hook.status !== "enabled") problems.push(`The webhook endpoint ${url} is ${hook.status}; enable it.`);
  else if (!hook.enabled_events.includes("*")) {
    const missing = WEBHOOK_EVENTS.filter((e) => !hook.enabled_events.includes(e));
    if (missing.length) problems.push(`The webhook endpoint is missing events: ${missing.join(", ")}.`);
  }
  return problems;
}
