import { NextRequest, NextResponse } from "next/server";
import { notifyOwner } from "@/lib/notify";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { activateSubscription, deactivateSubscription, syncMonthlySubscription } from "@/lib/subscription";
import { sendWelcomeEmail, sendCheckoutRecoveryEmail } from "@/lib/email";
import { OFFER_PERCENT_OFF, grantOffer } from "@/lib/offers";
import { pppBeatsOffer } from "@/lib/ppp";
import { prisma } from "@/lib/db";
import { PLANS, planById } from "@/lib/plans";
import { sendPurchaseToGA4 } from "@/lib/ga-server";
import { describeSource } from "@/lib/referrer";
import { handleDispute, handleRefund } from "@/lib/refunds";
import { sendCheckoutReminderIfDue } from "@/lib/checkout-reminder";
import { recordCheckoutLog, type CheckoutLogOutcome } from "@/lib/checkout-recovery-log";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function periodEnd(sub: Stripe.Subscription): Date | null {
  // API 2025+ moved current_period_end onto the item; older shapes keep it on the subscription.
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const ts = item?.current_period_end ?? legacy;
  return ts ? new Date(ts * 1000) : null;
}

/**
 * A checkout the buyer has finished: the money is in (checkout.session.completed with payment_status "paid", or
 * checkout.session.async_payment_succeeded when a delayed method clears). Plans unlock. Payment is
 * checked below, so an unpaid session that completes does nothing until its payment succeeds.
 */
async function fulfilCheckout(session: Stripe.Checkout.Session) {
    const email = session.customer_email ?? session.customer_details?.email ?? null;

    const customerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
    const plan = planById(session.metadata?.plan) ?? PLANS.lifetime;
    const name = session.customer_details?.name;

    console.log(`[stripe:checkout.session.completed] email=${email} customer=${customerId} plan=${plan.id} paid=${session.payment_status}`);
    if (!email || !customerId) return;
    // Access is for money received, nothing less. A bank redirect (Przelewy24, Sofort, SEPA...) or Klarna can
    // complete the checkout before the money arrives, or without it ever arriving: those come back as
    // checkout.session.async_payment_succeeded (fulfilled here then) or _failed. A 100%-off code completes it with
    // nothing paid ("no_payment_required"): no access either, but the owner hears of it and can grant it by hand.
    if (session.payment_status !== "paid") {
      console.log(`[stripe:checkout.session.completed] not paid (${session.payment_status}): no access for ${email}`);
      if (session.payment_status === "no_payment_required") {
        void notifyOwner({
          subject: `Checkout completed with nothing paid: ${email}`,
          text: `${name ?? "Someone"} <${email}> completed a ${plan.name} checkout with nothing paid (a 100%-off code?). No access was given. Checkout session ${session.id}, Stripe customer ${customerId}.`,
          replyTo: email,
        });
      }
      return;
    }

    // Purchasing-power parity: we don't block a mismatch between where
    // the visitor browsed from and where their card is, but we do note it.
    const pppCountry = session.metadata?.ppp_country || "";
    const cardCountry = session.customer_details?.address?.country ?? "";
    const pppNote = pppCountry
      ? ` Parity pricing: tier ${session.metadata?.ppp_tier} for ${pppCountry}${cardCountry && cardCountry !== pppCountry ? ` (card country ${cardCountry} differs)` : ""}.`
      : "";
    if (pppCountry && cardCountry && cardCountry !== pppCountry) {
      console.log(`[stripe:checkout.session.completed] ppp mismatch: browsed from ${pppCountry}, card ${cardCountry}`);
    }

    // Where they came from (src/lib/referrer.ts), for the owner's email: what we kept at sign-up, else the
    // cookie at checkout. Never blocks the sale.
    let sourceNote = "";
    try {
      const buyer = await prisma.user.findUnique({
        where: { email },
        select: { signupSource: true, signupCampaign: true, signupReferrer: true, signupLanding: true, heardAbout: true },
      });
      const md = session.metadata ?? {};
      sourceNote = ` Source: ${describeSource({
        ...buyer,
        signupReferrer: buyer?.signupReferrer ?? (md.ref_host || null),
        signupLanding: buyer?.signupReferrer ? buyer.signupLanding : md.ref_landing || null,
      })}.`;
    } catch (err) {
      console.error("[stripe:checkout.session.completed] source lookup failed:", err);
    }

    // Record the sale in GA4 from the server: the client-side event on the
    // dashboard depends on the buyer landing there with analytics allowed.
    // Awaited: a serverless function may be frozen the moment it answers, and an unawaited send with it. It never throws.
    await sendPurchaseToGA4({
      clientId: session.metadata?.ga_client_id,
      sessionId: session.metadata?.ga_session_id,
      transactionId: session.id,
      value: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? "usd",
      plan: plan.id,
      planName: plan.name,
    });

    if (plan.id === "lifetime") {
      await activateSubscription(email, customerId, { plan: "lifetime" });
      void notifyOwner({
        subject: `New purchase: ${email}`,
        text: `${name ?? "Someone"} <${email}> bought lifetime access. Stripe customer ${customerId}.${pppNote}${sourceNote}`,
        replyTo: email,
      });
      try {
        await sendWelcomeEmail(name, email, "lifetime");
      } catch (err) {
        console.error("[stripe:checkout.session.completed] Welcome email failed:", err);
      }
      return;
    }

    // Subscription plans: fetch the subscription for its id and period end.
    const subId = typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);
    let end: Date | null = null;
    if (subId) {
      try {
        end = periodEnd(await getStripe().subscriptions.retrieve(subId));
      } catch (err) {
        console.error("[stripe:checkout.session.completed] subscription retrieve failed:", err);
      }
    }

    if (plan.id === "monthly") {
      await activateSubscription(email, customerId, { plan: "monthly", stripeSubscriptionId: subId, currentPeriodEnd: end });
      void notifyOwner({
        subject: `New Expedition Pass: ${email}`,
        text: `${name ?? "Someone"} <${email}> started the monthly Expedition Pass. Stripe customer ${customerId}, subscription ${subId}.${pppNote}${sourceNote}`,
        replyTo: email,
      });
      try {
        await sendWelcomeEmail(name, email, "monthly");
      } catch (err) {
        console.error("[stripe:checkout.session.completed] Welcome email failed:", err);
      }
      return;
    }

}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await fulfilCheckout(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "checkout.session.async_payment_failed": {
        // A delayed payment (bank redirect, Klarna) that never arrived: nothing was given for it, so nothing to take
        // back. The owner hears of it in case the buyer writes in.
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email ?? session.customer_details?.email ?? null;
        console.log(`[stripe:checkout.session.async_payment_failed] email=${email} session=${session.id}`);
        void notifyOwner({
          subject: `Payment failed, no access given: ${email ?? "unknown buyer"}`,
          text: `A delayed payment for checkout session ${session.id} failed (${session.metadata?.plan ?? session.metadata?.product ?? "lifetime"}). ${email ?? "The buyer"} was not given access or sent anything.`,
          ...(email ? { replyTo: email } : {}),
        });
        break;
      }

      case "checkout.session.expired": {
        // Abandoned checkout (sessions expire 2 h after creation, see
        // create-checkout). Offer a time-limited discount to come back.
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email ?? session.customer_details?.email ?? null;
        const plan = session.metadata?.plan ?? "lifetime";
        console.log(`[stripe:checkout.session.expired] email=${email} plan=${plan}`);
        // Every step below is kept in EmailLead (src/lib/checkout-recovery-log.ts) so /admin/marketing can count
        // expired sessions, emails sent and who bought afterwards.
        const log = (outcome: CheckoutLogOutcome, reason?: string) =>
          recordCheckoutLog({ email, sessionId: session.id, outcome, reason, name: session.customer_details?.name });
        await log("expired");
        // (a checkout that already carried a parity discount at least as big as the offer gets no offer: see pppBeatsOffer)
        const pppLower = pppBeatsOffer(session.metadata?.ppp_country, OFFER_PERCENT_OFF);
        let offerSent = false;
        let noOfferWhy: string;
        if (!email) noOfferWhy = "no-email";
        else if (plan !== "lifetime") noOfferWhy = "not-lifetime";
        else if (pppLower) noOfferWhy = "ppp-price-lower";
        else {
          noOfferWhy = "no-offer"; // grantOffer: no account, or already paid
          try {
            const offer = await grantOffer(email, "checkout-abandoned");
            if (offer) {
              const accepted = await sendCheckoutRecoveryEmail({
                name: session.customer_details?.name,
                email,
                code: offer.code,
                expiresAt: offer.expiresAt,
                percentOff: offer.percentOff,
              });
              if (accepted) {
                offerSent = true;
                // a live offer they already held (lesson, section or nurture) is repeated, not replaced
                await log(offer.reused ? "recovery-resent" : "recovery-sent");
              } else noOfferWhy = "recovery-send-failed";
            }
          } catch (err) {
            noOfferWhy = "offer-error";
            console.error("[stripe:checkout.session.expired] recovery offer failed:", err);
          }
        }
        // Everyone the discount email didn't reach (monthly, parity prices, no offer possible) gets the
        // plain reminder instead: what's included, the guarantee, a way back (src/lib/checkout-reminder.ts).
        if (!offerSent) {
          console.log(`[stripe:checkout.session.expired] no discount email: ${noOfferWhy}`);
          try {
            const outcome = await sendCheckoutReminderIfDue(session);
            console.log(`[stripe:checkout.session.expired] reminder=${outcome}`);
            if (outcome === "sent") await log("reminder-sent");
            else await log("skipped", outcome);
          } catch (err) {
            console.error("[stripe:checkout.session.expired] reminder failed:", err);
            await log("skipped", "reminder-error");
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = event.type === "customer.subscription.deleted" ? "canceled" : subscription.status;
        const end = periodEnd(subscription);
        console.log(`[stripe:${event.type}] subscription=${subscription.id} status=${status}`);

        // New-style rows are keyed by subscription id: monthly passes.
        if (await syncMonthlySubscription(subscription.id, status, end)) break;

        // Legacy rows (pre-2026 monthly plan) were keyed by customer email.
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const customer = (await getStripe().customers.retrieve(customerId)) as Stripe.Customer;
        if (customer.email) {
          if (status === "active" || status === "trialing") {
            await activateSubscription(customer.email, customerId, { plan: "monthly", stripeSubscriptionId: subscription.id, currentPeriodEnd: end });
          } else if (status === "past_due" || status === "canceled" || status === "unpaid") {
            await deactivateSubscription(customer.email);
          }
        }
        break;
      }

      // Refunds and disputes (src/lib/refunds.ts): a full refund or a lost dispute removes lifetime access,
      // and the owner is emailed either way.
      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      case "charge.dispute.created":
      case "charge.dispute.closed":
        await handleDispute(event.data.object as Stripe.Dispute, event.type === "charge.dispute.closed");
        break;

      default:
        console.log(`[stripe:unhandled] event.type=${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
