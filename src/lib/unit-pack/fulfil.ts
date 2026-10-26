/**
 * A bought Ancient Egypt Writing Unit (server only; called from the Stripe webhook's checkout.session.completed
 * when metadata.product is "unit-pack"): counted in GA4, kept as a lead, the PDF emailed, the owner told.
 */
import type Stripe from "stripe";
import { notifyOwner } from "@/lib/notify";
import { recordLead } from "@/lib/leads";
import { sendPurchaseToGA4 } from "@/lib/ga-server";
import { buildUnitPackPdf } from "@/lib/unit-pack/pdf";
import { sendUnitPackEmail } from "@/lib/unit-pack/email";
import { UNIT_PACK, isPaper, unitPackDownloadPath } from "@/lib/unit-pack/product";

export function isUnitPackSession(session: Pick<Stripe.Checkout.Session, "metadata">): boolean {
  return session.metadata?.product === UNIT_PACK.id;
}

export async function fulfilUnitPack(session: Stripe.Checkout.Session, email: string | null): Promise<void> {
  const md = session.metadata ?? {};
  const paper = isPaper(md.paper) ? md.paper : "a4";
  console.log(`[stripe:checkout.session.completed] unit pack email=${email} paper=${paper} from=${md.from} paid=${session.payment_status}`);
  if (session.payment_status !== "paid" || !email) return;

  const amount = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "usd").toUpperCase();
  await sendPurchaseToGA4({
    clientId: md.ga_client_id,
    sessionId: md.ga_session_id,
    transactionId: session.id,
    value: amount,
    currency: session.currency ?? "usd",
    plan: UNIT_PACK.id,
    planName: UNIT_PACK.name,
  });
  await recordLead({ email, source: "unit-pack", name: session.customer_details?.name ?? null });

  let delivered = true;
  try {
    const pdf = await buildUnitPackPdf({ paper });
    const site = process.env.NEXTAUTH_URL ?? "https://www.learnhieroglyphics.com";
    await sendUnitPackEmail(email, pdf, {
      paper,
      downloadUrl: site + unitPackDownloadPath(session.id, paper),
      otherPaperUrl: site + unitPackDownloadPath(session.id, paper === "letter" ? "a4" : "letter"),
    });
  } catch (err) {
    // The thank-you page still serves the PDF against the session id.
    delivered = false;
    console.error("[stripe:checkout.session.completed] unit pack delivery failed:", err);
  }

  void notifyOwner({
    subject: `Unit pack sold: ${email}`,
    text: `${email} bought the ${UNIT_PACK.name} (${amount.toFixed(2)} ${currency}, ${paper}, from ${md.from ?? "?"}). ${
      delivered ? "PDF emailed." : "The email FAILED: send them the download link."
    } Checkout session ${session.id}.`,
    replyTo: email,
  });
}
