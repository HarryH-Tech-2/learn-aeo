import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, getStripe } from "@/lib/stripe";
import { getActiveOffer, promotionCodeIdFor } from "@/lib/offers";
import { COUNTRY_COOKIE, currencyForCountry } from "@/lib/pricing";
import { PLANS, planById, stripePriceIdFor } from "@/lib/plans";
import { pppFor } from "@/lib/ppp";
import { checkoutSubmitText } from "@/lib/checkout-copy";
import { checkSubscription } from "@/lib/subscription";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie } from "@/lib/ga-server";
import { cancelUrlFor } from "@/lib/checkout-return";
import { REFERRER_COOKIE, decodeReferrer } from "@/lib/referrer";

// Abandoned sessions expire after this long; Stripe then sends
// checkout.session.expired and the webhook emails a recovery offer.
const SESSION_TTL_SECONDS = 2 * 60 * 60;

/**
 * POST /api/stripe/create-checkout  { plan?: "lifetime" | "monthly", from?: string, promo?: boolean }
 * → { url }  Defaults to lifetime when no plan is given; any other plan value is a 400. `from` is the page the
 * buyer came from, where Cancel takes them back to (src/lib/checkout-return.ts); `promo` shows Stripe's
 * promotion-code box. Lifetime uses mode "payment", monthly "subscription"; the plan travels in metadata so the
 * webhook knows what was bought.
 *
 * An account that already holds the plan (or Lifetime, which covers the
 * monthly pass) is sent to the dashboard instead of to Stripe:
 * { url: "/dashboard?already=active", alreadyActive: true }.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 });
    }
    const email = session.user.email;
    const userId = (session.user as { id?: string }).id ?? "";

    let body: { plan?: unknown; from?: unknown; promo?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    // Only the two plans this site sells. No plan at all means Lifetime; anything else (an old classroom or
    // school link, junk) is refused rather than quietly sold as Lifetime.
    const plan = body.plan === undefined ? PLANS.lifetime : planById(typeof body.plan === "string" ? body.plan : null);
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan. Choose Lifetime or Monthly." }, { status: 400 });
    }

    // Never sell someone what they already own.
    const access = await checkSubscription(email).catch(() => null);
    // (the free-unlock test's free group has the course already: src/lib/access-test.ts)
    const owned = access?.active && (access.via === "lifetime" || access.via === "free-unlock" || (access.via === "monthly" && plan.id === "monthly"));
    if (owned) {
      console.log(`[create-checkout] ${email} already has ${access?.via} access; skipping ${plan.id} checkout`);
      return NextResponse.json({ url: "/dashboard?already=active", alreadyActive: true });
    }

    const priceId = stripePriceIdFor(plan);
    if (!priceId) {
      console.error(`[create-checkout] no Stripe price configured for plan ${plan.id} (${plan.envKey})`);
      return NextResponse.json({ error: "This plan is not available yet." }, { status: 503 });
    }

    const stripe = getStripe();

    // GBP for UK visitors. createCheckoutSession falls back to the Price's
    // default currency if this Price carries no GBP option.
    const country = request.cookies.get(COUNTRY_COOKIE)?.value ?? request.headers.get("x-vercel-ip-country");
    const currency = currencyForCountry(country) === "GBP" ? "gbp" : undefined;

    // Discounts, largest wins: purchasing-power parity for the visitor's
    // country (every plan), or a live offer (post-free-lesson / checkout
    // recovery, lifetime only). The promotion-code box only for someone who
    // arrived with a code to type (?promo): shown to everyone, it sent people
    // off hunting for one.
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    const ppp = pppFor(country);
    const offer = plan.id === "lifetime" ? await getActiveOffer(email) : null;
    let applied: "ppp" | "offer" | null = null;
    if (ppp && (!offer || ppp.percentOff >= offer.percentOff)) {
      discounts = [{ coupon: ppp.couponId }];
      applied = "ppp";
    } else if (offer) {
      const promoId = await promotionCodeIdFor(offer).catch(() => null);
      if (promoId) {
        discounts = [{ promotion_code: promoId }];
        applied = "offer";
      }
    }

    // (NEXTAUTH_URL ends in "/" in production, which made every return link "…com//dashboard")
    const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/+$/, "");
    const ref = decodeReferrer(request.cookies.get(REFERRER_COOKIE)?.value);
    const metadata = {
      email,
      userId,
      plan: plan.id,
      offer: applied === "offer" && offer ? offer.code : "",
      ppp_country: applied === "ppp" && ppp ? ppp.country : "",
      ppp_tier: applied === "ppp" && ppp ? ppp.tier : "",
      // GA4 client id, so the webhook can record the purchase against this visitor.
      ga_client_id: gaClientIdFromCookie(request.cookies.get("_ga")?.value),
      ga_session_id: gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value),
      // where they first came from (src/lib/referrer.ts), for when GA4 is blocked; empty without consent
      ref_host: ref?.host ?? "",
      ref_landing: ref?.landing ?? "",
    };

    const common: Stripe.Checkout.SessionCreateParams = {
      // No payment_method_types: Stripe picks from the dashboard's enabled
      // methods, which surfaces Apple Pay / Google Pay / Link on capable devices.
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discounts ? { discounts } : body.promo === true ? { allow_promotion_codes: true } : {}),
      billing_address_collection: "auto",
      // what they get and the refund, beside the Pay button (src/lib/checkout-copy.ts)
      custom_text: { submit: { message: checkoutSubmitText(plan) } },
      expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      metadata,
      // {CHECKOUT_SESSION_ID} is filled in by Stripe; the dashboard uses it as the
      // GA4 purchase transaction_id so a refresh can't double-count.
      success_url: `${base}/dashboard?checkout=success&plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`,
      // back to the page they came from, not always /pricing
      cancel_url: cancelUrlFor(base, typeof body.from === "string" ? body.from : null),
    };

    const params: Stripe.Checkout.SessionCreateParams =
      plan.mode === "payment"
        ? {
            ...common,
            mode: "payment",
            // Create a Stripe Customer so we can send invoices and manage payment
            // methods later via the billing portal.
            customer_creation: "always",
            // Generate a finalized invoice for each one-time purchase so customers
            // can download a PDF from the billing portal's Invoice History.
            invoice_creation: { enabled: true },
          }
        : {
            ...common,
            mode: "subscription",
            subscription_data: { metadata },
          };

    const checkoutSession = await createCheckoutSession(stripe, params, currency);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
