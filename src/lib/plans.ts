/**
 * The plan catalogue. Two ways to pay, one source of truth for the pricing
 * page, checkout, the webhook and the account page.
 *
 *   lifetime   one payment of $100 (£80), the anchor
 *   monthly    $10 (£8) a month, cancel any time
 *
 * Nothing else is sold. A Stripe event naming any other plan (or none) is
 * logged and acknowledged by the webhook without granting access.
 *
 * Stripe Price ids come from the environment (see scripts/stripe-create-plans.mjs,
 * which creates the products and prints the variables). Amounts here must
 * match the Prices in Stripe: USD is the default currency, GBP a
 * currency_option on the same Price.
 */
import type { Currency } from "@/lib/pricing";

export type PlanId = "lifetime" | "monthly";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** Stripe Checkout mode */
  mode: "payment" | "subscription";
  interval?: "month";
  /** Amounts in major units */
  usd: number;
  gbp: number;
  /** Who it is for, one line */
  audience: string;
  features: string[];
  /** Environment variable holding the Stripe Price id */
  envKey: string;
  /** Shown as the main card */
  featured?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    tagline: "Pay once. Keep it for good.",
    mode: "payment",
    usd: 100,
    gbp: 80,
    audience: "For marketers who want the whole course, for good",
    features: [
      "All 8 lessons, including every lesson as it's released",
      "Free AEO tools and templates",
      "Certificate to share on LinkedIn",
      "14-day money-back guarantee",
    ],
    envKey: "STRIPE_PRICE_ID",
    featured: true,
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    tagline: "Learn a month at a time.",
    mode: "subscription",
    interval: "month",
    usd: 10,
    gbp: 8,
    audience: "For trying the whole course without paying up front",
    features: ["Everything in Lifetime while it runs", "Cancel any time from your account", "Progress kept if you come back"],
    envKey: "STRIPE_PRICE_MONTHLY",
  },
};

export const PLAN_IDS: PlanId[] = ["lifetime", "monthly"];

export function isPlanId(x: unknown): x is PlanId {
  return typeof x === "string" && (PLAN_IDS as string[]).includes(x);
}

export function planById(id: string | null | undefined): Plan | undefined {
  return isPlanId(id) ? PLANS[id] : undefined;
}

export function planAmount(plan: Plan, currency: Currency): number {
  return currency === "GBP" ? plan.gbp : plan.usd;
}

/** Minor units for Stripe (pence / cents). */
export function planMinor(plan: Plan, currency: Currency): number {
  return Math.round(planAmount(plan, currency) * 100);
}

export function formatPlanPrice(plan: Plan, currency: Currency): string {
  const symbol = currency === "GBP" ? "£" : "$";
  const amount = planAmount(plan, currency);
  const text = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${symbol}${text}`;
}

export function planPeriodLabel(plan: Plan): string {
  return plan.mode === "payment" ? "one payment" : "per month";
}

export function stripePriceIdFor(plan: Plan): string | undefined {
  return process.env[plan.envKey] || undefined;
}
