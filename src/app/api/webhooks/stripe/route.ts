import { NextRequest, NextResponse } from "next/server";
import { notifyOwner } from "@/lib/notify";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { activateSubscription, deactivateSubscription, syncMonthlySubscription } from "@/lib/subscription";
import { createLicence, isLicenceKind, syncLicenceSubscription } from "@/lib/licence";
import { sendWelcomeEmail, sendCheckoutRecoveryEmail, sendLicenceEmail, sendCartouchePrintEmail, sendGiftCourseEmail } from "@/lib/email";
import { CARTOUCHE_PRINT, cartoucheHdImageFilename, cartoucheImageDownloadPath, cartouchePrintDownloadPath, cartouchePrintFilename, cartouchePrintFormat, cartouchePrintFormatById, cartouchePrintName, cartouchePrintNames, cartouchePrintSubject, cartouchePrintTheme, isCartouchePrintSession, isPaidCartouchePrintSession, joinCartoucheNames } from "@/lib/cartouche-print";
import { assetUrl, createProdigiOrder, prodigiConfigured, type ProdigiRecipient } from "@/lib/prodigi";
import { buildCartouchePrintPdf } from "@/lib/cartouche-print-pdf";
import { renderCartouchePrintJpeg } from "@/lib/cartouche-print-image";
import { recordLead } from "@/lib/leads";
import { OFFER_PERCENT_OFF, grantOffer } from "@/lib/offers";
import { pppBeatsOffer } from "@/lib/ppp";
import { prisma } from "@/lib/db";
import { PLANS, planById } from "@/lib/plans";
import { sendPurchaseToGA4 } from "@/lib/ga-server";
import { describeSource } from "@/lib/referrer";
import { handleDispute, handleRefund } from "@/lib/refunds";
import { sendCheckoutReminderIfDue } from "@/lib/checkout-reminder";
import { recordCheckoutLog, type CheckoutLogOutcome } from "@/lib/checkout-recovery-log";
import { KEYBOARD_HD, KEYBOARD_HD_PATH, cleanText, isKeyboardStyle, isKeyboardTemplate, keyboardStyleById } from "@/lib/keyboard-card";
import { renderKeyboardJpeg } from "@/lib/keyboard-image";
import { sendKeyboardHdEmail } from "@/lib/keyboard-email";
import { fulfilUnitPack, isUnitPackSession } from "@/lib/unit-pack/fulfil";
import { fulfilClassSet, isClassSetSession } from "@/lib/class-set-server";
import { fulfilLicenceInvoice, isLicenceInvoice } from "@/lib/licence-invoice";
import { GIFT_COURSE, certificateImagePath, giftFromSession, giftRedeemPath } from "@/lib/gift-course";
import { giftCode } from "@/lib/gift-code";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function periodEnd(sub: Stripe.Subscription): Date | null {
  // API 2025+ moved current_period_end onto the item; older shapes keep it on the subscription.
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const ts = item?.current_period_end ?? legacy;
  return ts ? new Date(ts * 1000) : null;
}

/** A bought HD keyboard picture: counted, kept as a lead, and emailed with a link that rebuilds it. */
async function fulfilKeyboardImage(session: Stripe.Checkout.Session, email: string | null) {
  const md = session.metadata ?? {};
  const spell = md.spell === "name" ? "name" : "keys";
  const typed = cleanText(md.keys ?? "", spell);
  const style = isKeyboardStyle(md.style) ? md.style : "plain";
  const template = isKeyboardTemplate(md.template) ? md.template : "none";
  const letters = md.letters === "1";
  console.log(`[stripe:checkout.session.completed] keyboard image email=${email} keys=${typed.join("")} style=${style} paid=${session.payment_status}`);
  if (session.payment_status !== "paid" || !email || typed.length === 0) return;

  const amount = (session.amount_total ?? 0) / 100;
  await sendPurchaseToGA4({
    clientId: md.ga_client_id,
    sessionId: md.ga_session_id,
    transactionId: session.id,
    value: amount,
    currency: session.currency ?? "usd",
    plan: KEYBOARD_HD.id,
    planName: KEYBOARD_HD.name,
  });
  await recordLead({ email, source: "keyboard-image", name: typed.join("").trim().slice(0, 60) });

  try {
    const file = await renderKeyboardJpeg(typed, style, template, "hd", spell, letters);
    const downloadUrl = `${process.env.NEXTAUTH_URL}${KEYBOARD_HD_PATH}?session_id=${encodeURIComponent(session.id)}`;
    await sendKeyboardHdEmail(email, { typed, style, template, spell, letters }, file, downloadUrl);
  } catch (err) {
    // The thank-you page can still serve the picture against the session id.
    console.error("[stripe:checkout.session.completed] keyboard image delivery failed:", err);
  }

  void notifyOwner({
    subject: `Keyboard HD picture sold: ${typed.join("").trim().slice(0, 40)}`,
    text: `${email} bought the HD keyboard picture "${typed.join("").trim()}" on ${keyboardStyleById(style).label} (${amount.toFixed(2)} ${(session.currency ?? "usd").toUpperCase()}). Checkout session ${session.id}.`,
    replyTo: email,
  });
}

/** A gifted course bought: counted, the buyer kept as a lead, and emailed the gift link and the certificate. */
async function fulfilGiftCourse(session: Stripe.Checkout.Session, email: string | null) {
  const gift = giftFromSession(session);
  console.log(`[stripe:checkout.session.completed] gift course email=${email} recipient=${gift?.recipient} paid=${session.payment_status}`);
  if (!gift || session.payment_status !== "paid" || !email) return;
  const amount = (session.amount_total ?? 0) / 100;
  await sendPurchaseToGA4({
    clientId: session.metadata?.ga_client_id,
    sessionId: session.metadata?.ga_session_id,
    transactionId: session.id,
    value: amount,
    currency: session.currency ?? "usd",
    plan: GIFT_COURSE.id,
    planName: GIFT_COURSE.name,
  });
  await recordLead({ email, source: "gift-course", name: gift.recipient });
  const base = process.env.NEXTAUTH_URL;
  const giftUrl = `${base}${giftRedeemPath(giftCode(session.id))}`;
  try {
    await sendGiftCourseEmail({ email, recipient: gift.recipient, from: gift.from, giftUrl, certificateUrl: `${base}${certificateImagePath(gift.recipient, new Date(), gift.from)}` });
  } catch (err) {
    // The thank-you page shows the same link against the session id.
    console.error("[stripe:checkout.session.completed] gift email failed:", err);
  }
  void notifyOwner({
    subject: `Gift course sold: for ${gift.recipient}`,
    text: `${email} bought the course as a gift for "${gift.recipient}"${gift.from ? ` from ${gift.from}` : ""} (${amount.toFixed(2)} ${(session.currency ?? "usd").toUpperCase()}). Checkout session ${session.id}. Gift link: ${giftUrl}`,
    replyTo: email,
  });
}

/**
 * Deliver a paid Cartouche Print: the PDF (or, for the HD image, the JPEG) goes out by email with a link that
 * rebuilds it, the sale is counted, and the buyer is kept as a lead (they
 * asked to be emailed a product, not a newsletter).
 */
async function fulfilCartouchePrint(session: Stripe.Checkout.Session, email: string | null) {
  const name = cartouchePrintName(session);
  const format = cartouchePrintFormatById(cartouchePrintFormat(session));
  console.log(`[stripe:checkout.session.completed] cartouche print email=${email} name=${name} format=${format.id} paid=${session.payment_status}`);
  if (!isPaidCartouchePrintSession(session) || !name || !email) return;
  // Every name on the order: [name] for a one-name order, two to four for a family print.
  const names = cartouchePrintNames(session);
  const allNames = joinCartoucheNames(names);

  const amount = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "usd").toUpperCase();
  await sendPurchaseToGA4({
    clientId: session.metadata?.ga_client_id,
    sessionId: session.metadata?.ga_session_id,
    transactionId: session.id,
    value: amount,
    currency: session.currency ?? "usd",
    plan: format.stripeProductId,
    planName: `${CARTOUCHE_PRINT.name} · ${format.label}`,
  });
  await recordLead({ email, source: "cartouche-print", name });

  // The posted print: hand the page-one PDF to Prodigi. If that cannot happen
  // (no key, or Prodigi refuses), the owner is told to place it by hand; the
  // buyer still gets their PDF and the shipping promise in the email.
  let placed: { id: string } | null = null;
  let placeError: string | null = null;
  const recipient = format.physical ? recipientFrom(session, email) : null;
  if (format.physical) {
    if (!recipient) {
      placeError = "no shipping address on the session";
    } else if (!prodigiConfigured()) {
      placeError = "PRODIGI_API_KEY is not set";
    } else {
      try {
        placed = await createProdigiOrder({
          sessionId: session.id,
          format: format.id,
          recipient,
          assetUrl: assetUrl(session.id),
          callbackUrl: `${process.env.NEXTAUTH_URL}/api/prodigi/callback`,
          idempotencyKey: session.id,
        });
      } catch (err) {
        placeError = err instanceof Error ? err.message : String(err);
        console.error("[stripe:checkout.session.completed] prodigi order failed:", err);
      }
    }
  }

  try {
    const theme = cartouchePrintTheme(session);
    // One name builds exactly as before; a family print builds every name onto the page.
    const subject = cartouchePrintSubject(session) ?? name;
    const fileStem = names.join(" ");
    const delivery =
      format.file === "jpeg"
        ? {
            file: await renderCartouchePrintJpeg(subject, theme, "hd"),
            filename: cartoucheHdImageFilename(fileStem, theme),
            downloadUrl: `${process.env.NEXTAUTH_URL}${cartoucheImageDownloadPath(session.id)}`,
          }
        : {
            file: await buildCartouchePrintPdf(subject, theme),
            filename: cartouchePrintFilename(fileStem),
            downloadUrl: `${process.env.NEXTAUTH_URL}${cartouchePrintDownloadPath(session.id)}`,
          };
    await sendCartouchePrintEmail({
      email,
      name: names.length > 1 ? joinCartoucheNames(names) : name,
      ...(names.length > 1 ? { family: true } : {}),
      format: format.id,
      ...delivery,
    });
  } catch (err) {
    // The success page can still serve the file against the session id.
    console.error("[stripe:checkout.session.completed] cartouche print delivery failed:", err);
  }

  const address = recipient
    ? `${recipient.name}, ${[recipient.line1, recipient.line2, recipient.city, recipient.state, recipient.postcode, recipient.country].filter(Boolean).join(", ")}`
    : "n/a";
  void notifyOwner({
    subject: placeError
      ? `ACTION NEEDED: Cartouche Print (${format.label}) not placed with Prodigi: ${allNames}`
      : `Cartouche Print sold (${format.label}): ${allNames}`,
    text: [
      `${email} bought a Cartouche Print, ${format.label}, of "${allNames}"${names.length > 1 ? ` (family print, ${names.length} names)` : ""} (${amount.toFixed(2)} ${currency}). Checkout session ${session.id}.`,
      format.physical ? `Ship to: ${address}` : "",
      placed ? `Prodigi order ${placed.id} placed.` : "",
      placeError ? `Prodigi order NOT placed (${placeError}). Place it by hand in the Prodigi dashboard using the artwork URL: ${assetUrlSafe(session.id)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    replyTo: email,
  });
}

/** The artwork URL for the owner email; never throws even if signing is unconfigured. */
function assetUrlSafe(sessionId: string): string {
  try {
    return assetUrl(sessionId);
  } catch {
    return "(asset signing not configured)";
  }
}

/** Stripe puts the shipping address in one of two places depending on the API version. */
function recipientFrom(session: Stripe.Checkout.Session, email: string): ProdigiRecipient | null {
  const legacy = (session as unknown as { shipping_details?: Stripe.Checkout.Session.ShippingDetails | null }).shipping_details;
  const collected = session.collected_information?.shipping_details ?? null;
  const details = legacy ?? collected;
  const addr = details?.address;
  if (!addr?.line1 || !addr.city || !addr.postal_code || !addr.country) return null;
  return {
    name: details?.name || session.customer_details?.name || email,
    email,
    line1: addr.line1,
    line2: addr.line2 ?? null,
    city: addr.city,
    state: addr.state ?? null,
    postcode: addr.postal_code,
    country: addr.country,
  };
}

/**
 * A checkout the buyer has finished: the money is in (checkout.session.completed with payment_status "paid", or
 * checkout.session.async_payment_succeeded when a delayed method clears). Digital goods are sent; plans unlock.
 * Each product's fulfilment checks payment_status itself, and plans are checked below, so an unpaid session that
 * completes does nothing until its payment succeeds.
 */
async function fulfilCheckout(session: Stripe.Checkout.Session) {
    const email = session.customer_email ?? session.customer_details?.email ?? null;

    // A Cartouche Print is a digital good with no account behind it: build
    // the PDF and email it. Nothing below (plans, subscriptions) applies.
    if (isCartouchePrintSession(session)) {
      await fulfilCartouchePrint(session, email);
      return;
    }
    if (session.metadata?.product === KEYBOARD_HD.id) {
      await fulfilKeyboardImage(session, email);
      return;
    }
    // A course bought for someone else: nothing is unlocked until they open the gift link (src/app/api/gift/redeem).
    if (session.metadata?.product === GIFT_COURSE.id) {
      await fulfilGiftCourse(session, email);
      return;
    }
    // The Ancient Egypt Writing Unit (teacher pack PDF): src/lib/unit-pack/fulfil.ts.
    if (isUnitPackSession(session)) {
      await fulfilUnitPack(session, email);
      return;
    }
    // The Class Cartouche Set (every pupil's cartouche, one PDF): src/lib/class-set-server.ts.
    if (isClassSetSession(session)) {
      await fulfilClassSet(session, email);
      return;
    }

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

    if (isLicenceKind(plan.id)) {
      const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (!user) {
        console.error(`[stripe:checkout.session.completed] licence buyer ${email} has no account`);
        return;
      }
      const licence = await createLicence({
        ownerUserId: user.id,
        kind: plan.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subId,
        currentPeriodEnd: end,
      });
      void notifyOwner({
        subject: `New ${plan.name} licence: ${email}`,
        text: `${name ?? "Someone"} <${email}> bought a ${plan.name} licence (${licence.code}). Stripe customer ${customerId}, subscription ${subId}.${pppNote}${sourceNote}`,
        replyTo: email,
      });
      try {
        await sendLicenceEmail({ name, email, kind: plan.id, code: licence.code });
      } catch (err) {
        console.error("[stripe:checkout.session.completed] Licence email failed:", err);
      }
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
        if (isCartouchePrintSession(session) || session.metadata?.product === KEYBOARD_HD.id || session.metadata?.product === GIFT_COURSE.id || isUnitPackSession(session) || isClassSetSession(session)) break;
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
        // Everyone the discount email didn't reach (monthly, licences, parity prices, no offer possible) gets the
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

        // New-style rows are keyed by subscription id: monthly passes and licences.
        const matchedMonthly = await syncMonthlySubscription(subscription.id, status, end);
        const matchedLicence = matchedMonthly ? false : await syncLicenceSubscription(subscription.id, status, end);
        if (matchedMonthly || matchedLicence) break;

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

      // ── Licence paid by invoice / purchase order (src/lib/licence-invoice.ts) ──────────────────────────
      // Only invoices we raised for a school (metadata.product "licence-invoice"); subscription renewals
      // also fire invoice.paid and are left to customer.subscription.updated above.
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!isLicenceInvoice(invoice)) {
          console.log(`[stripe:invoice.paid] ${invoice.id} is not a licence invoice; ignored`);
          break;
        }
        const outcome = await fulfilLicenceInvoice(invoice);
        console.log(`[stripe:invoice.paid] licence invoice ${invoice.id}: ${outcome}`);
        break;
      }
      // ── end licence invoice ─────────────────────────────────────────────────────────────────────────

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
