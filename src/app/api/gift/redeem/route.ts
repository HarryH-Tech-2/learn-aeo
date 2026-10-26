import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { notifyOwner } from "@/lib/notify";
import { activateGiftedLifetime } from "@/lib/subscription";
import { giftFromSession } from "@/lib/gift-course";
import { verifyGiftCode } from "@/lib/gift-code";

export const dynamic = "force-dynamic";

/**
 * POST /api/gift/redeem  { code }  → { ok: true, result: "granted" | "already" }
 *
 * The signed-in recipient unlocks a gifted course. The code must be genuine (src/lib/gift-code.ts), the session paid
 * and a gift, and the payment not yet redeemed by someone else; redemption is then written onto the PaymentIntent.
 * Opening the same link again as the same person is fine.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const accountEmail = session?.user?.email ?? null;
  const email = accountEmail?.toLowerCase();
  if (!accountEmail || !email) return NextResponse.json({ error: "Sign in first, then open the gift." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sessionId = verifyGiftCode(typeof body?.code === "string" ? body.code : null);
  if (!sessionId) return NextResponse.json({ error: "This gift link isn't valid. Check it was copied in full." }, { status: 400 });

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent.latest_charge"] });
    const gift = giftFromSession(checkout);
    const pi = typeof checkout.payment_intent === "object" ? checkout.payment_intent : null;
    if (!gift || checkout.payment_status !== "paid" || !pi) {
      return NextResponse.json({ error: "This gift hasn't been paid for yet. Try again in a minute." }, { status: 409 });
    }
    const charge = typeof pi.latest_charge === "object" ? pi.latest_charge : null;
    if (pi.status !== "succeeded" || charge?.refunded || charge?.disputed) {
      return NextResponse.json({ error: "This gift is no longer active. Please contact us." }, { status: 409 });
    }
    const redeemedBy = pi.metadata?.redeemed_email;
    if (redeemedBy && redeemedBy !== email) {
      return NextResponse.json({ error: "This gift has already been opened by another account." }, { status: 409 });
    }

    const user = await prisma.user.findUnique({ where: { email: accountEmail }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "Sign in first, then open the gift." }, { status: 401 });
    const result = await activateGiftedLifetime(user.id);

    if (!redeemedBy) {
      await stripe.paymentIntents.update(pi.id, { metadata: { redeemed_email: email, redeemed_at: new Date().toISOString() } });
      void notifyOwner({
        subject: `Gift course opened: ${gift.recipient}`,
        text: `${email} opened the gifted course for "${gift.recipient}"${gift.from ? ` from ${gift.from}` : ""}${result === "already" ? " (they already had lifetime access)" : ""}. Checkout session ${checkout.id}.`,
        replyTo: email,
      });
    }
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[gift:redeem] failed:", error);
    return NextResponse.json({ error: "Something went wrong opening the gift. Please try again." }, { status: 500 });
  }
}
