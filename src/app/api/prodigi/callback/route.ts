import { NextRequest, NextResponse } from "next/server";
import { PRODIGI_REFERENCE_PREFIX, getProdigiOrder, prodigiConfigured, shippedTracking } from "@/lib/prodigi";
import { sendCartouchePrintShippedEmail } from "@/lib/email";
import { notifyOwner } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * POST /api/prodigi/callback
 *
 * Prodigi posts the order here on every status change. Callbacks are not
 * signed, so the body is only a hint: the order is fetched back from Prodigi
 * by id and acted on from that. When it has shipped, the buyer gets the
 * tracking link; when Prodigi flags a problem, the owner hears about it.
 */
export async function POST(request: NextRequest) {
  if (!prodigiConfigured()) return NextResponse.json({ ok: false, error: "Prodigi not configured" }, { status: 503 });

  const hint = (await request.json().catch(() => ({}))) as { id?: unknown; order?: { id?: unknown } };
  const id = typeof hint.id === "string" ? hint.id : typeof hint.order?.id === "string" ? hint.order.id : null;
  if (!id) return NextResponse.json({ ok: false, error: "No order id" }, { status: 400 });

  const order = await getProdigiOrder(id);
  if (!order) return NextResponse.json({ ok: false, error: "Unknown order" }, { status: 404 });
  if (!order.merchantReference?.startsWith(PRODIGI_REFERENCE_PREFIX)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const stage = order.status?.stage ?? "";
  const tracking = shippedTracking(order);
  const email = order.recipient?.email ?? null;
  const name = order.recipient?.name ?? "";

  if (tracking && email) {
    try {
      await sendCartouchePrintShippedEmail({ email, name, carrier: tracking.carrier, trackingUrl: tracking.url, trackingNumber: tracking.number });
    } catch (err) {
      console.error("[prodigi:callback] shipped email failed:", err);
    }
  }

  const problem = Object.entries(order.status?.details ?? {}).filter(([, v]) => v === "Error" || v === "Cancelled");
  if (stage === "Cancelled" || problem.length > 0) {
    void notifyOwner({
      subject: `Prodigi order ${order.id} needs a look (${stage})`,
      text: `Order ${order.id} for ${name} (${email ?? "no email"}) is at stage "${stage}". Details: ${JSON.stringify(order.status?.details ?? {})}. Reference ${order.merchantReference}.`,
    });
  }

  return NextResponse.json({ ok: true, stage, shipped: Boolean(tracking) });
}
