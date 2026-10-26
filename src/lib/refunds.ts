/**
 * Refunds and disputes (2026-10-16). The webhook (src/app/api/webhooks/stripe/route.ts) hands over the
 * charge.refunded / charge.dispute.* events; this finds what the charge paid for, takes lifetime access away
 * when the money has gone back for good (a full refund or a lost dispute), and emails the owner.
 *
 * Only lifetime access is removed automatically. Monthly passes end through their subscription, so for those
 * the email says what to do.
 */
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { notifyOwner } from "@/lib/notify";
import { revokeLifetime } from "@/lib/subscription";
import { planById } from "@/lib/plans";

export type PurchaseKind = "lifetime" | "monthly" | "product" | "unknown";

/** What a checkout session paid for, from the metadata checkout writes (null session: a charge we can't trace). */
export function purchaseKind(metadata: Record<string, string> | null | undefined, found: boolean): { kind: PurchaseKind; label: string } {
  if (!found) return { kind: "unknown", label: "a payment with no checkout session (an invoice, or made in the Stripe dashboard)" };
  const md = metadata ?? {};
  if (md.product) return { kind: "product", label: md.product };
  const plan = planById(md.plan);
  // A missing or unsold plan (old classroom/school metadata) was never granted access by the webhook, so its
  // refund takes none away: the owner is told to check it in Stripe.
  if (!plan) return { kind: "unknown", label: md.plan ? `the unsold plan "${md.plan}"` : "a checkout with no plan" };
  if (plan.id === "lifetime") return { kind: "lifetime", label: "Lifetime access" };
  return { kind: "monthly", label: plan.name };
}

export function formatMoney(minor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** "3 days" / "1 day" / "under a day" between two Unix times (seconds). */
export function heldFor(fromSeconds: number, toSeconds: number): string {
  const days = Math.floor((toSeconds - fromSeconds) / 86400);
  if (days < 1) return "under a day";
  return days === 1 ? "1 day" : `${days} days`;
}

type Purchase = { kind: PurchaseKind; label: string; email: string | null; name: string | null };

async function purchaseFor(charge: Stripe.Charge): Promise<Purchase> {
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : (charge.payment_intent?.id ?? null);
  let session: Stripe.Checkout.Session | null = null;
  if (pi) {
    try {
      session = (await getStripe().checkout.sessions.list({ payment_intent: pi, limit: 1 })).data[0] ?? null;
    } catch (err) {
      console.error("[refunds] session lookup failed:", err);
    }
  }
  const { kind, label } = purchaseKind(session?.metadata, !!session);
  const email = session?.customer_email ?? session?.customer_details?.email ?? charge.billing_details?.email ?? charge.receipt_email ?? null;
  const name = session?.customer_details?.name ?? charge.billing_details?.name ?? null;
  return { kind, label, email, name };
}

async function revokeIfLifetime(p: Purchase): Promise<string> {
  if (p.kind !== "lifetime") return "";
  if (!p.email) return " Could not remove access: no email on the payment.";
  const removed = await revokeLifetime(p.email);
  return removed ? " Their lifetime access has been removed." : " They had no lifetime access on the site to remove.";
}

const NEXT_STEP: Record<PurchaseKind, string> = {
  lifetime: "",
  monthly: " If they asked to stop, cancel the subscription in Stripe as well; access ends when it does.",
  product: " Nothing to remove on the site.",
  unknown: " Check it in Stripe.",
};

/** charge.refunded: fully refunded charges lose lifetime access; every refund is emailed to the owner. */
export async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const p = await purchaseFor(charge);
  const full = charge.refunded;
  const access = full ? await revokeIfLifetime(p) : "";
  const now = Math.floor(Date.now() / 1000);
  const who = `${p.name ?? "A customer"} <${p.email ?? "no email"}>`;
  console.log(`[refunds] ${charge.id} ${full ? "full" : "partial"} refund, ${p.kind}, ${p.email}`);
  await notifyOwner({
    subject: `${full ? "Refund" : "Partial refund"}: ${p.email ?? charge.id}`,
    text:
      `${who} was refunded ${formatMoney(charge.amount_refunded, charge.currency)} of ${formatMoney(charge.amount, charge.currency)} for ${p.label}, ` +
      `${heldFor(charge.created, now)} after paying. Charge ${charge.id}.` +
      (full ? access || NEXT_STEP[p.kind] : " A partial refund leaves their access as it is."),
    ...(p.email ? { replyTo: p.email } : {}),
  });
}

/** charge.dispute.created / charge.dispute.closed: the owner is told; a lost dispute loses lifetime access. */
export async function handleDispute(dispute: Stripe.Dispute, closed: boolean): Promise<void> {
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id;
  let p: Purchase = { kind: "unknown", label: "unknown purchase", email: null, name: null };
  try {
    p = await purchaseFor(await getStripe().charges.retrieve(chargeId));
  } catch (err) {
    console.error("[refunds] dispute charge lookup failed:", err);
  }
  const who = `${p.name ?? "A customer"} <${p.email ?? "no email"}>`;
  const amount = formatMoney(dispute.amount, dispute.currency);
  console.log(`[refunds] dispute ${dispute.id} ${closed ? `closed ${dispute.status}` : "opened"}, ${p.kind}, ${p.email}`);

  if (!closed) {
    const due = dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toUTCString() : "see Stripe";
    await notifyOwner({
      subject: `Dispute opened: ${p.email ?? chargeId}`,
      text:
        `${who} disputed ${amount} for ${p.label} with their bank (reason: ${dispute.reason}). ` +
        `Evidence is due by ${due}. Respond in the Stripe dashboard (dispute ${dispute.id}). Access stays on unless the dispute is lost.`,
    });
    return;
  }

  const lost = dispute.status === "lost";
  const access = lost ? await revokeIfLifetime(p) : "";
  await notifyOwner({
    subject: `Dispute ${lost ? "lost" : dispute.status}: ${p.email ?? chargeId}`,
    text: `The ${amount} dispute from ${who} for ${p.label} closed as "${dispute.status}" (dispute ${dispute.id}).${access}`,
  });
}
