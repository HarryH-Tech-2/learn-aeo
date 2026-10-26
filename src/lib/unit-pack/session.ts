/**
 * Server only: read a unit-pack Checkout Session back from Stripe (the thank-you page and the download route
 * both serve the PDF against the session id, as the keyboard's HD picture does).
 */
import { getStripe } from "@/lib/stripe";
import { looksLikeCheckoutSessionId } from "@/lib/cartouche-print";
import { UNIT_PACK, isPaper, type Paper } from "@/lib/unit-pack/product";

export type UnitPackPurchase = { found: boolean; paid: boolean; paper: Paper; email: string | null };

export async function lookUpUnitPackSession(sessionId: string | null | undefined): Promise<UnitPackPurchase> {
  const none: UnitPackPurchase = { found: false, paid: false, paper: "a4", email: null };
  if (!looksLikeCheckoutSessionId(sessionId)) return none;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const md = session.metadata ?? {};
    if (md.product !== UNIT_PACK.id) return none;
    return {
      found: true,
      paid: session.payment_status === "paid",
      paper: isPaper(md.paper) ? md.paper : "a4",
      email: session.customer_details?.email ?? session.customer_email ?? null,
    };
  } catch (err) {
    console.error("[unit-pack] session lookup failed:", err);
    return none;
  }
}
