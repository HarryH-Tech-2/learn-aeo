/**
 * The Class Cartouche Set, server side (src/lib/class-set.ts has the product): reading a session back from
 * Stripe for the thank-you page and the download route, and fulfilling a paid one from the Stripe webhook's
 * checkout.session.completed (metadata.product "class-set"): counted in GA4, kept as a lead, the PDF emailed,
 * the owner told. Mirrors the unit pack (src/lib/unit-pack/fulfil.ts, session.ts, email.ts).
 */
import type Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { notifyOwner, ownerEmail } from "@/lib/notify";
import { recordLead } from "@/lib/leads";
import { sendPurchaseToGA4 } from "@/lib/ga-server";
import { buildClassSetPdf } from "@/lib/cartouche-print-pdf";
import { looksLikeCheckoutSessionId, type CartouchePrintThemeId } from "@/lib/cartouche-print";
import { button, emailLayout, heading, link, paragraph } from "@/lib/email-layout";
import {
  CLASS_SET,
  DEFAULT_CLASS_SET_THEME,
  classSetDownloadPath,
  classSetFilename,
  decodeClassSetNames,
  isClassSetTheme,
} from "@/lib/class-set";

const SITE = () => process.env.NEXTAUTH_URL || "https://www.learnhieroglyphics.com";

export function isClassSetSession(session: Pick<Stripe.Checkout.Session, "metadata">): boolean {
  return session.metadata?.product === CLASS_SET.id;
}

function themeOf(session: Pick<Stripe.Checkout.Session, "metadata">): CartouchePrintThemeId {
  const t = session.metadata?.theme;
  return isClassSetTheme(t) ? t : DEFAULT_CLASS_SET_THEME;
}

export type ClassSetPurchase = { found: boolean; paid: boolean; names: string[]; theme: CartouchePrintThemeId; email: string | null };

export async function lookUpClassSetSession(sessionId: string | null | undefined): Promise<ClassSetPurchase> {
  const none: ClassSetPurchase = { found: false, paid: false, names: [], theme: DEFAULT_CLASS_SET_THEME, email: null };
  if (!looksLikeCheckoutSessionId(sessionId)) return none;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (!isClassSetSession(session)) return none;
    return {
      found: true,
      paid: session.payment_status === "paid",
      names: decodeClassSetNames(session.metadata),
      theme: themeOf(session),
      email: session.customer_details?.email ?? session.customer_email ?? null,
    };
  } catch (err) {
    console.error("[class-set] session lookup failed:", err);
    return none;
  }
}

function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

/** Pure: the bought set's email, for the webhook and its test. No hieroglyphs in the text: mail clients lack the font. */
export function renderClassSetEmail(input: { count: number; downloadUrl: string }) {
  const site = SITE();
  const classUrl = `${site}/teachers/class`;
  const body = [
    heading("Your Class Cartouche Set"),
    paragraph(
      `Thank you. The PDF is attached: ${input.count} pupil${input.count === 1 ? "" : "s"}, each with their name in a cartouche on their own A4 page, and a class page at the back with every name, its signs and the letters they stand for.`,
    ),
    paragraph("If the attachment goes missing, this link builds it again:"),
    button(input.downloadUrl, "Download the set", { center: true }),
    paragraph(
      `To finish the lesson, the live class quiz puts hieroglyphs on the whiteboard and the class answers in teams; it is free to try for 7 days: ${link(classUrl, classUrl.replace(/^https?:\/\//, ""))}.`,
    ),
    paragraph("A name spelled oddly, or a pupil missing? Reply with the change and I will send you a corrected set."),
  ].join("");
  const html = emailLayout({
    baseUrl: site.replace(/\/$/, ""),
    preheader: `Your Class Cartouche Set is attached: ${input.count} names, one page each.`,
    body,
    signature: "Founder, Learn Hieroglyphics",
    reason: "Learn Hieroglyphics &middot; reply to this email with any question, it comes straight to me.",
  });
  const text = [
    `Thank you. Your Class Cartouche Set is attached: ${input.count} pupils, one A4 page each, and a class page at the back.`,
    `If the attachment goes missing: ${input.downloadUrl}`,
    `The live class quiz, free for 7 days: ${classUrl}`,
    "A name spelled oddly, or a pupil missing? Reply with the change and I will send a corrected set.\n\nHarry",
  ].join("\n\n");
  return { subject: `Your ${CLASS_SET.name} (PDF attached)`, html, text };
}

async function sendClassSetEmail(to: string, pdf: Uint8Array, input: { count: number; downloadUrl: string }) {
  const mail = renderClassSetEmail(input);
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: fromAddress(),
    to,
    replyTo: ownerEmail(),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [{ filename: classSetFilename(), content: Buffer.from(pdf) }],
    tags: [{ name: "purchase", value: CLASS_SET.id }],
  });
  if (result.error) throw new Error(`Resend: ${result.error.message}`);
}

export async function fulfilClassSet(session: Stripe.Checkout.Session, email: string | null): Promise<void> {
  const md = session.metadata ?? {};
  const names = decodeClassSetNames(md);
  const theme = themeOf(session);
  console.log(`[stripe:checkout.session.completed] class set email=${email} names=${names.length} theme=${theme} from=${md.from} paid=${session.payment_status}`);
  if (session.payment_status !== "paid" || !email) return;

  const amount = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "usd").toUpperCase();
  await sendPurchaseToGA4({
    clientId: md.ga_client_id,
    sessionId: md.ga_session_id,
    transactionId: session.id,
    value: amount,
    currency: session.currency ?? "usd",
    plan: CLASS_SET.id,
    planName: CLASS_SET.name,
  });
  await recordLead({ email, source: "class-set", name: session.customer_details?.name ?? null });

  let delivered = true;
  try {
    const pdf = await buildClassSetPdf(names, theme);
    await sendClassSetEmail(email, pdf, { count: names.length, downloadUrl: SITE() + classSetDownloadPath(session.id) });
  } catch (err) {
    // The thank-you page still serves the PDF against the session id.
    delivered = false;
    console.error("[stripe:checkout.session.completed] class set delivery failed:", err);
  }

  void notifyOwner({
    subject: `Class set sold: ${email}`,
    text: `${email} bought the ${CLASS_SET.name} (${amount.toFixed(2)} ${currency}, ${names.length} names, ${theme} paper, from ${md.from ?? "?"}). ${
      delivered ? "PDF emailed." : "The email FAILED: send them the download link."
    } Checkout session ${session.id}.`,
    replyTo: email,
  });
}
