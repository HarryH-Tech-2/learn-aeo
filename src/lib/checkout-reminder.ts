import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { planById, type Plan } from "@/lib/plans";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { sendCheckoutReminderEmail } from "@/lib/email";

/**
 * The plain reminder after an unpaid checkout expires: what the plan includes, the 14-day guarantee, their price and a
 * way back. No discount. It goes to everyone the discount email (sendCheckoutRecoveryEmail, Lifetime only, no parity
 * discount) does not reach: the monthly pass, parity-priced buyers, and anyone whose offer could not be made.
 *
 * Nobody who left checkout between May and Oct 2026 was emailed (22 of 26 people with accounts): see the diagnosis in
 * project_conversion_build_2026-10-15 (memory).
 *
 * One EmailSend row per session (key "checkout-reminder:<session id>") is written before sending, so a webhook retry
 * cannot send twice, and the same rows enforce at most one reminder per person per 30 days.
 */

export const REMINDER_KEY_PREFIX = "checkout-reminder:";
export const REMINDER_COOLDOWN_DAYS = 30;

export type ReminderSkip = "no-email" | "no-plan" | "no-user" | "unsubscribed" | "owns-plan" | "already-sent" | "cooldown";

export type ReminderFacts = {
  email: string | null;
  plan: Plan | undefined;
  user: { unsubscribed: boolean } | null;
  /** already paid for this plan, or has access that covers it */
  ownsPlan: boolean;
  sentForSession: boolean;
  /** the last reminder (any session) inside the cooldown */
  recentReminder: boolean;
};

/** Whether to send, or why not. Pure, so the rules are tested without a database. */
export function reminderDecision(f: ReminderFacts): { send: true } | { send: false; reason: ReminderSkip } {
  if (!f.email) return { send: false, reason: "no-email" };
  if (!f.plan) return { send: false, reason: "no-plan" };
  if (!f.user) return { send: false, reason: "no-user" };
  if (f.user.unsubscribed) return { send: false, reason: "unsubscribed" };
  if (f.ownsPlan) return { send: false, reason: "owns-plan" };
  if (f.sentForSession) return { send: false, reason: "already-sent" };
  if (f.recentReminder) return { send: false, reason: "cooldown" };
  return { send: true };
}

/** "$100", "£80", "$35" — what Stripe actually asked them to pay, parity discount and all. */
export function formatSessionPrice(amountMinor: number | null | undefined, currency: string | null | undefined): string | null {
  if (amountMinor == null || !currency) return null;
  try {
    // en-GB writes dollars as "US$", so pounds use en-GB and everything else en-US ("$13.39", "€18.50")
    const locale = currency.toLowerCase() === "gbp" ? "en-GB" : "en-US";
    // whole amounts without ".00": "$100", "£80" (the pricing page's style), "$66.99" otherwise
    const digits = amountMinor % 100 === 0 ? 0 : 2;
    return new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase(), minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amountMinor / 100);
  } catch {
    return null;
  }
}

/** Back to checkout for the same plan, tagged so /admin/marketing and GA4 can count the returns. */
export function reminderCheckoutUrl(baseUrl: string, plan: Plan): string {
  return `${baseUrl.replace(/\/$/, "")}/checkout?plan=${plan.id}&utm_source=email&utm_medium=email&utm_campaign=checkout_reminder`;
}

/**
 * Sends the reminder for an expired session if the rules allow it. Returns what happened, for the webhook log.
 * Callers skip sessions the discount email already covered.
 */
export async function sendCheckoutReminderIfDue(session: Stripe.Checkout.Session, now = new Date()): Promise<"sent" | ReminderSkip | "send-failed"> {
  const email = session.customer_email ?? session.customer_details?.email ?? null;
  const plan = planById(session.metadata?.plan ?? "lifetime");
  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          emailUnsubscribedAt: true,
          emailSends: { where: { key: { startsWith: REMINDER_KEY_PREFIX } }, select: { key: true, sentAt: true } },
        },
      })
    : null;

  const key = `${REMINDER_KEY_PREFIX}${session.id}`;
  const cutoff = now.getTime() - REMINDER_COOLDOWN_DAYS * 86400 * 1000;
  const facts: ReminderFacts = {
    email,
    plan,
    user: user ? { unsubscribed: !!user.emailUnsubscribedAt } : null,
    ownsPlan: user && email && plan ? await ownsPlan(email, now) : false,
    sentForSession: !!user?.emailSends.some((s) => s.key === key),
    recentReminder: !!user?.emailSends.some((s) => s.sentAt.getTime() >= cutoff),
  };
  const decision = reminderDecision(facts);
  if (!decision.send) return decision.reason;
  // (the decision guarantees these; narrowed for TypeScript)
  if (!user || !email || !plan) return "no-user";

  // claim the send first: a retried webhook hits the unique (userId, key) and stops here
  try {
    await prisma.emailSend.create({ data: { userId: user.id, key } });
  } catch {
    return "already-sent";
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "";
  const sent = await sendCheckoutReminderEmail({
    email,
    name: session.customer_details?.name ?? user.name,
    plan,
    price: formatSessionPrice(session.amount_total, session.currency),
    checkoutUrl: reminderCheckoutUrl(baseUrl, plan),
    unsubscribeUrl: unsubscribeUrl(user.id, baseUrl),
  });
  if (!sent) {
    // let a later expiry try again rather than leave a row for an email that never went
    await prisma.emailSend.delete({ where: { userId_key: { userId: user.id, key } } }).catch(() => {});
    return "send-failed";
  }
  return "sent";
}

/** Any course access counts (a Lifetime owner needs no pass). */
async function ownsPlan(email: string, now: Date): Promise<boolean> {
  return (await checkSubscription(email, now)).active;
}
