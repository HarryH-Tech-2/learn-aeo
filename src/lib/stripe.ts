import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

/** Stripe rejecting a session because the Price carries no option in the requested currency. */
export function isCurrencyNotSupported(error: unknown): boolean {
  const e = error as { type?: string; message?: string } | null;
  return e?.type === "StripeInvalidRequestError" && /currenc/i.test(e.message ?? "");
}

/**
 * Create a Checkout Session, in `currency` when one is asked for (GBP for a UK
 * visitor). Trying the currency first and retrying without it on a rejection
 * means we never have to read the Price, which the restricted key in Vercel is
 * not allowed to do: reading it silently failed and every UK buyer was charged
 * in dollars (found 2026-09-25).
 */
export async function createCheckoutSession(
  stripe: Stripe,
  params: Stripe.Checkout.SessionCreateParams,
  currency?: "gbp",
): Promise<Stripe.Checkout.Session> {
  if (!currency) return stripe.checkout.sessions.create(params);
  try {
    return await stripe.checkout.sessions.create({ ...params, currency });
  } catch (error) {
    if (!isCurrencyNotSupported(error)) throw error;
    console.warn(`[stripe] the Price has no ${currency} option; charging in its default currency`);
    return stripe.checkout.sessions.create(params);
  }
}
