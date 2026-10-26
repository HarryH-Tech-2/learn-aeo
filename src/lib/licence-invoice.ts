/**
 * Pay by invoice / purchase order, for schools that cannot pay by card.
 *
 *   1. A signed-in teacher fills in the form on /teachers/licence (POST /api/licence/invoice).
 *   2. We create a Stripe Customer for the school and a "send_invoice" Invoice, payable in 30 days, then
 *      finalise and send it: Stripe emails the school's contact a hosted invoice page (bank transfer or card).
 *   3. When it is paid, the invoice.paid webhook calls fulfilLicenceInvoice: the licence is made for the
 *      teacher who asked, exactly as the card path makes it (createLicence), and the class code is emailed.
 *
 * If Stripe refuses at any step (the production key is a restricted key and may lack Customers/Invoices write),
 * the owner is emailed every detail with "ACTION NEEDED" to raise the invoice by hand, and the visitor is told
 * the invoice will follow within one working day. An invoice raised by hand in the Stripe dashboard is only
 * fulfilled automatically if it carries the same metadata (see the owner email), otherwise Harry issues the
 * licence himself.
 *
 * No pdf-lib here: the webhook imports this module (the quote PDF is src/lib/licence-quote-pdf.ts).
 */
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";
import { createLicence, isLicenceKind, renameLicence, seatsForKind, type LicenceKind } from "@/lib/licence";
import { sendLicenceEmail } from "@/lib/email";
import { sendPurchaseToGA4 } from "@/lib/ga-server";
import { PLANS, formatPlanPrice, planMinor } from "@/lib/plans";
import { currencyForCountry, type Currency } from "@/lib/pricing";

export const LICENCE_INVOICE_PRODUCT = "licence-invoice";
export const INVOICE_DAYS_UNTIL_DUE = 30;
export const LICENCE_TERM_DAYS = 365;

export type InvoiceRequest = {
  plan: LicenceKind;
  schoolName: string;
  contactName: string;
  contactEmail: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  /** ISO 3166 alpha-2, upper case */
  country: string;
  poNumber: string;
  vatNumber: string;
  /** Renewing a licence the teacher already owns (from the renewal email): its id, checked against the owner. */
  renewLicenceId: string;
};

export type InvoiceOwner = { userId: string; email: string; gaClientId?: string; gaSessionId?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function field(body: Record<string, unknown>, key: string, max: number): string {
  const v = body[key];
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function parseInvoiceRequest(raw: unknown): { ok: true; value: InvoiceRequest } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Please fill in the form." };
  const body = raw as Record<string, unknown>;
  const plan = body.plan;
  if (!isLicenceKind(plan)) return { ok: false, error: "Choose the Classroom or School licence." };
  const value: InvoiceRequest = {
    plan,
    schoolName: field(body, "schoolName", 120),
    contactName: field(body, "contactName", 80),
    contactEmail: field(body, "contactEmail", 160).toLowerCase(),
    line1: field(body, "line1", 120),
    line2: field(body, "line2", 120),
    city: field(body, "city", 80),
    postcode: field(body, "postcode", 20),
    country: field(body, "country", 10).toUpperCase(),
    // (Stripe allows 140 characters in a custom field value)
    poNumber: field(body, "poNumber", 60),
    vatNumber: field(body, "vatNumber", 30),
    renewLicenceId: /^[a-z0-9]{8,40}$/.test(field(body, "renewLicenceId", 40)) ? field(body, "renewLicenceId", 40) : "",
  };
  if (!value.schoolName) return { ok: false, error: "Add the school's name." };
  if (!value.contactName) return { ok: false, error: "Add the name of the person the invoice is for." };
  if (!EMAIL_RE.test(value.contactEmail)) return { ok: false, error: "Add the email address the invoice should go to." };
  if (!value.line1 || !value.city || !value.postcode) return { ok: false, error: "Add the billing address: first line, town or city and postcode." };
  if (!/^[A-Z]{2}$/.test(value.country)) return { ok: false, error: "Choose the country." };
  return { ok: true, value };
}

/** GBP for a UK school, USD everywhere else: the same rule as card checkout. */
export function invoiceCurrency(country: string): Currency {
  return currencyForCountry(country);
}

export function licenceLineDescription(plan: LicenceKind): string {
  const p = PLANS[plan];
  const who = plan === "school" ? "unlimited pupils and teachers at one school" : `one teacher and up to ${p.seats} pupils`;
  return `Learn Hieroglyphics ${p.name} licence, 12 months: ${who}`;
}

export function invoicePriceLabel(plan: LicenceKind, country: string): string {
  return formatPlanPrice(PLANS[plan], invoiceCurrency(country));
}

/** Stripe refusing because the key is not allowed to do this (the restricted production key). */
export function isStripePermissionError(error: unknown): boolean {
  const e = error as { type?: string; statusCode?: number; code?: string } | null;
  return e?.type === "StripePermissionError" || e?.statusCode === 403 || e?.code === "secret_key_required";
}

export function invoiceMetadata(req: InvoiceRequest, owner: InvoiceOwner): Record<string, string> {
  return {
    product: LICENCE_INVOICE_PRODUCT,
    plan: req.plan,
    owner_user_id: owner.userId,
    owner_email: owner.email,
    school: req.schoolName.slice(0, 120),
    contact_name: req.contactName,
    po_number: req.poNumber,
    renew_licence_id: req.renewLicenceId,
    ga_client_id: owner.gaClientId ?? "",
    ga_session_id: owner.gaSessionId ?? "",
  };
}

/** Everything Harry needs to raise the invoice by hand, plain text. */
export function invoiceRequestSummary(req: InvoiceRequest, owner: InvoiceOwner): string {
  const currency = invoiceCurrency(req.country);
  return [
    `Plan: ${PLANS[req.plan].name} licence, ${formatPlanPrice(PLANS[req.plan], currency)} ${currency} (12 months)`,
    `School: ${req.schoolName}`,
    `Invoice to: ${req.contactName} <${req.contactEmail}>`,
    `Billing address: ${[req.line1, req.line2, req.city, req.postcode, req.country].filter(Boolean).join(", ")}`,
    `PO number: ${req.poNumber || "(none given)"}`,
    `VAT number: ${req.vatNumber || "(none given)"}`,
    `Licence goes to the account: ${owner.email} (user ${owner.userId})`,
    `Terms: send_invoice, due in ${INVOICE_DAYS_UNTIL_DUE} days`,
  ].join("\n");
}

export type IssuedInvoice = { invoiceId: string; customerId: string; number: string | null; hostedInvoiceUrl: string | null };

/**
 * Create the Customer and Invoice in Stripe, finalise it and have Stripe email it. Throws on any refusal; the
 * caller falls back to a hand-raised invoice. Offers bank transfer (customer_balance) alongside card when the
 * account allows it, otherwise the dashboard's default invoice payment methods.
 */
export async function issueLicenceInvoice(stripe: Stripe, req: InvoiceRequest, owner: InvoiceOwner): Promise<IssuedInvoice> {
  const currency = invoiceCurrency(req.country).toLowerCase();
  const metadata = invoiceMetadata(req, owner);
  const customer = await stripe.customers.create({
    name: req.schoolName,
    email: req.contactEmail,
    address: { line1: req.line1, line2: req.line2 || undefined, city: req.city, postal_code: req.postcode, country: req.country },
    preferred_locales: ["en-GB"],
    metadata,
  });

  const customFields: Stripe.InvoiceCreateParams.CustomField[] = [{ name: "For the attention of", value: req.contactName.slice(0, 140) }];
  if (req.poNumber) customFields.push({ name: "Purchase order", value: req.poNumber });
  if (req.vatNumber) customFields.push({ name: "Customer VAT number", value: req.vatNumber });

  const base: Stripe.InvoiceCreateParams = {
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: INVOICE_DAYS_UNTIL_DUE,
    currency,
    pending_invoice_items_behavior: "exclude",
    auto_advance: false,
    custom_fields: customFields,
    description: `${PLANS[req.plan].name} licence for ${req.schoolName}. The licence starts the day this invoice is paid and runs for 12 months.`,
    footer: "Questions about this invoice: contact@learnhieroglyphics.com",
    metadata,
  };
  let invoice: Stripe.Invoice;
  try {
    invoice = await stripe.invoices.create({ ...base, payment_settings: { payment_method_types: ["card", "customer_balance"] } });
  } catch (error) {
    if (isStripePermissionError(error)) throw error;
    // Bank transfers not switched on for this account or currency: use the dashboard's invoice payment methods.
    console.warn("[licence-invoice] bank transfer not available, using default payment methods:", (error as Error).message);
    invoice = await stripe.invoices.create(base);
  }

  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: planMinor(PLANS[req.plan], invoiceCurrency(req.country)),
    currency,
    description: licenceLineDescription(req.plan),
    metadata: { product: LICENCE_INVOICE_PRODUCT, plan: req.plan },
  });
  const finalised = await stripe.invoices.finalizeInvoice(invoice.id!, { auto_advance: false });
  const sent = await stripe.invoices.sendInvoice(finalised.id!);
  return { invoiceId: sent.id!, customerId: customer.id, number: sent.number ?? null, hostedInvoiceUrl: sent.hosted_invoice_url ?? null };
}

export type InvoiceRequestOutcome = { mode: "sent"; invoice: IssuedInvoice } | { mode: "manual" };

/** Issue the invoice, or hand it to Harry by email if Stripe will not. Never throws. */
export async function requestLicenceInvoice(stripe: Stripe | null, req: InvoiceRequest, owner: InvoiceOwner): Promise<InvoiceRequestOutcome> {
  const summary = invoiceRequestSummary(req, owner);
  let failure = "no Stripe key configured";
  let permission = false;
  if (stripe) {
    try {
      const invoice = await issueLicenceInvoice(stripe, req, owner);
      void notifyOwner({
        subject: `Licence invoice sent: ${PLANS[req.plan].name}, ${req.schoolName}`,
        text: `${summary}\n\nStripe invoice ${invoice.number ?? invoice.invoiceId} sent to ${req.contactEmail}. The licence is created automatically when it is paid (invoice.paid webhook).\n${invoice.hostedInvoiceUrl ?? ""}`,
        replyTo: req.contactEmail,
      });
      return { mode: "sent", invoice };
    } catch (error) {
      const e = error as { type?: string; message?: string };
      failure = `${e?.type ?? "Error"}: ${e?.message ?? String(error)}`;
      permission = isStripePermissionError(error);
      console.error("[licence-invoice] Stripe refused, falling back to a hand-raised invoice:", error);
    }
  }
  const metadataLines = Object.entries(invoiceMetadata(req, owner))
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k} = ${v}`)
    .join("\n");
  await notifyOwner({
    subject: `ACTION NEEDED: issue invoice by hand in the Stripe dashboard (${PLANS[req.plan].name} licence, ${req.schoolName})`,
    text: [
      `A school asked to pay by invoice and Stripe did not issue it automatically (${failure}).`,
      `The visitor was told the invoice will arrive within one working day.`,
      permission
        ? `The Stripe key is not allowed to do this. To make it automatic, give the restricted key in Vercel write access to Customers, Invoices and Invoice items (Stripe > Developers > API keys > edit key).`
        : ``,
      ``,
      summary,
      ``,
      `In Stripe: Invoices > Create invoice, customer = the school (email ${req.contactEmail}), payment terms "email invoice", due in ${INVOICE_DAYS_UNTIL_DUE} days, one line: "${licenceLineDescription(req.plan)}" at ${invoicePriceLabel(req.plan, req.country)}.`,
      `Add the PO number as a custom field. To have the licence made automatically when it is paid, add this metadata to the invoice:`,
      metadataLines,
      `Otherwise, once it is paid, create the licence for ${owner.email} by hand.`,
    ].join("\n"),
    replyTo: req.contactEmail,
  });
  return { mode: "manual" };
}

export function isLicenceInvoice(invoice: Pick<Stripe.Invoice, "metadata">): boolean {
  return invoice.metadata?.product === LICENCE_INVOICE_PRODUCT;
}

export type InvoiceFulfilment = "created" | "duplicate" | "no-account" | "bad-metadata";

/**
 * invoice.paid for a licence invoice: make the licence for the teacher who asked, as the card path does, and
 * email the class code. Safe to run twice (Stripe retries): the invoice's own customer finds the licence.
 */
/** The end of a renewed invoiced licence: one more term from its old end if that is still ahead, else from today. */
export function renewedPeriodEnd(oldEnd: Date | null, now = new Date()): Date {
  const from = oldEnd && oldEnd.getTime() > now.getTime() ? oldEnd : now;
  return new Date(from.getTime() + LICENCE_TERM_DAYS * 86_400_000);
}

export async function fulfilLicenceInvoice(invoice: Stripe.Invoice, now = new Date()): Promise<InvoiceFulfilment> {
  const md = invoice.metadata ?? {};
  const kind = md.plan;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : (invoice.customer?.id ?? null);
  const amount = (invoice.amount_paid ?? 0) / 100;
  const currency = (invoice.currency ?? "usd").toUpperCase();
  const ref = invoice.number ?? invoice.id;
  console.log(`[stripe:invoice.paid] licence invoice ${invoice.id} plan=${kind} owner=${md.owner_email} customer=${customerId}`);

  if (!isLicenceKind(kind) || !customerId) {
    await notifyOwner({
      subject: `ACTION NEEDED: licence invoice ${ref} paid but its metadata is incomplete`,
      text: `Invoice ${invoice.id} (${amount.toFixed(2)} ${currency}) was paid but has no valid plan or customer (plan=${kind ?? "none"}). Create the licence by hand for ${md.owner_email || "the teacher"}.`,
    });
    return "bad-metadata";
  }


  const user =
    (md.owner_user_id ? await prisma.user.findUnique({ where: { id: md.owner_user_id }, select: { id: true, email: true, name: true } }) : null) ??
    (md.owner_email ? await prisma.user.findUnique({ where: { email: md.owner_email }, select: { id: true, email: true, name: true } }) : null);
  if (!user?.email) {
    // The card path logs and stops here; an invoice was paid by a school, so Harry is told to sort it out.
    console.error(`[stripe:invoice.paid] licence invoice owner ${md.owner_email} has no account`);
    await notifyOwner({
      subject: `ACTION NEEDED: licence invoice ${ref} paid, but the teacher's account is gone`,
      text: `${md.school || "A school"} paid ${amount.toFixed(2)} ${currency} for a ${PLANS[kind].name} licence (invoice ${invoice.id}), but no account was found for ${md.owner_email || md.owner_user_id || "(unknown)"}. Ask them to sign in, then create the licence by hand.`,
      replyTo: md.owner_email || undefined,
    });
    return "no-account";
  }

  // One licence per paid invoice: Stripe retries a webhook, so the invoice id is marked first (the unique
  // (userId, key) pair makes a retry's create fail). A second paid invoice from the same school is not a retry.
  try {
    await prisma.emailSend.create({ data: { userId: user.id, key: `licence-invoice:${invoice.id}` } });
  } catch {
    return "duplicate";
  }

  // A renewal (asked for from the renewal email: renew_licence_id, and only a licence this teacher owns):
  // it runs on for another term from whichever is later, its old end or today, and keeps its class code, so no
  // pupil has to join again. Any other invoice is a new licence. A change of plan never leaves fewer seats than
  // the pupils already in it.
  const previous = md.renew_licence_id
    ? await prisma.licence.findFirst({
        where: { id: md.renew_licence_id, ownerUserId: user.id, stripeSubscriptionId: null },
        select: { id: true, kind: true, currentPeriodEnd: true, _count: { select: { members: true } } },
      })
    : null;
  const renewedKind: LicenceKind =
    previous && isLicenceKind(previous.kind) && seatsForKind(kind) !== 0 && previous._count.members > seatsForKind(kind) ? previous.kind : kind;
  const licence = previous
    ? await prisma.licence.update({
        where: { id: previous.id },
        data: {
          kind: renewedKind,
          seats: seatsForKind(renewedKind),
          status: "active",
          stripeCustomerId: customerId,
          currentPeriodEnd: renewedPeriodEnd(previous.currentPeriodEnd, now),
        },
      })
    : await createLicence({
        ownerUserId: user.id,
        kind,
        stripeCustomerId: customerId,
        stripeSubscriptionId: null,
        currentPeriodEnd: new Date(now.getTime() + LICENCE_TERM_DAYS * 86_400_000),
      });
  if (md.school && !licence.schoolName) await renameLicence(user.id, licence.id, md.school);

  await sendPurchaseToGA4({
    clientId: md.ga_client_id,
    sessionId: md.ga_session_id,
    transactionId: invoice.id ?? ref ?? "licence-invoice",
    value: amount,
    currency: invoice.currency ?? "usd",
    plan: kind,
    planName: `${PLANS[kind].name} (invoice)`,
  });

  void notifyOwner({
    subject: `Licence invoice paid: ${PLANS[kind].name}, ${md.school || user.email}`,
    text: `Invoice ${ref} (${amount.toFixed(2)} ${currency}) paid${md.po_number ? `, PO ${md.po_number}` : ""}. ${PLANS[kind].name} licence ${licence.code} ${previous ? "renewed" : "created"} for ${user.email}, running until ${licence.currentPeriodEnd?.toISOString().slice(0, 10)} (no auto-renewal; a reminder goes out a month before).`,
    replyTo: user.email,
  });
  try {
    await sendLicenceEmail({ name: user.name ?? md.contact_name, email: user.email, kind, code: licence.code });
  } catch (err) {
    console.error("[stripe:invoice.paid] Licence email failed:", err);
  }
  return "created";
}
