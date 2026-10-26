/**
 * The plan catalogue. Four ways to pay, one source of truth for the pricing
 * page, checkout, the webhook and the account page.
 *
 *   lifetime   one payment, the anchor
 *   monthly    Expedition Pass, cancel any time
 *   classroom  yearly, one teacher and a class of 30 pupils
 *   school     yearly, unlimited classes at one school
 *
 * Stripe Price ids come from the environment (see scripts/stripe-create-plans.mjs,
 * which creates the products and prints the variables). Amounts here must
 * match the Prices in Stripe: USD is the default currency, GBP a
 * currency_option on the same Price.
 */
import type { Currency } from "@/lib/pricing";

export type PlanId = "lifetime" | "monthly" | "classroom" | "school";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** Stripe Checkout mode */
  mode: "payment" | "subscription";
  interval?: "month" | "year";
  /** Amounts in major units */
  usd: number;
  gbp: number;
  /** Pupil seats included (0 = unlimited; undefined = not a licence) */
  seats?: number;
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
    tagline: "Pay once. Learn forever.",
    mode: "payment",
    usd: 19.99,
    gbp: 15.99,
    audience: "For one learner, for good",
    features: ["All 8 chambers and every future one", "Every 3D practice game", "The Journey: relics, seals and the sealed door", "Shareable completion certificate", "14-day money-back guarantee"],
    envKey: "STRIPE_PRICE_ID",
    featured: true,
  },
  monthly: {
    id: "monthly",
    name: "Expedition Pass",
    tagline: "Dig for a month at a time.",
    mode: "subscription",
    interval: "month",
    usd: 4.99,
    gbp: 3.99,
    audience: "For trying the whole course without paying up front",
    features: ["Everything in Lifetime while it runs", "Cancel any time from your account", "Progress kept if you come back"],
    envKey: "STRIPE_PRICE_MONTHLY",
  },
  classroom: {
    id: "classroom",
    name: "Classroom",
    tagline: "One teacher, one class, a year.",
    mode: "subscription",
    interval: "year",
    usd: 29.5,
    gbp: 24.5,
    seats: 30,
    audience: "For a teacher and up to 30 pupils",
    features: ["Full course for you and 30 pupils", "A class code pupils join with", "Pupil progress on one page", "Classroom mode live quizzes", "Printable worksheets and answer keys"],
    envKey: "STRIPE_PRICE_CLASSROOM",
  },
  school: {
    id: "school",
    name: "School",
    tagline: "Every class at one school.",
    mode: "subscription",
    interval: "year",
    usd: 124.5,
    gbp: 99.5,
    seats: 0,
    audience: "For a whole school, unlimited pupils",
    features: ["Everything in Classroom", "Unlimited pupils and teachers", "One invoice for the school office", "Priority support"],
    envKey: "STRIPE_PRICE_SCHOOL",
  },
};

export const PLAN_IDS: PlanId[] = ["lifetime", "monthly", "classroom", "school"];

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
  if (plan.mode === "payment") return "one payment";
  return plan.interval === "year" ? "per year" : "per month";
}

/** Licence plans grant access to a group, not one account. */
export function isLicencePlan(plan: Plan | PlanId): boolean {
  const id = typeof plan === "string" ? plan : plan.id;
  return id === "classroom" || id === "school";
}

export function stripePriceIdFor(plan: Plan): string | undefined {
  return process.env[plan.envKey] || undefined;
}
