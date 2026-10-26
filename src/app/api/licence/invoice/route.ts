import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { allowSend, clientIp } from "@/lib/send-limit";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie } from "@/lib/ga-server";
import { parseInvoiceRequest, requestLicenceInvoice, INVOICE_DAYS_UNTIL_DUE } from "@/lib/licence-invoice";

/**
 * POST /api/licence/invoice  { plan, schoolName, contactName, contactEmail, line1, line2?, city, postcode, country, poNumber?, vatNumber? }
 *   → { ok: true, mode: "sent", number, hostedInvoiceUrl, dueDays }   Stripe emailed the invoice
 *   → { ok: true, mode: "manual" }                                       Harry raises it by hand within a working day
 *
 * Signed in only: the licence is made for the account that asks, when the invoice is paid (src/lib/licence-invoice.ts).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return NextResponse.json({ error: "Sign in first, so the licence can be added to your account." }, { status: 401 });

  // Every request creates a Stripe customer and sends an email: three an hour per visitor and per account is plenty.
  if (!allowSend(`licence-invoice:ip:${clientIp(request)}`, 3, 3_600_000) || !allowSend(`licence-invoice:user:${user.id}`, 3, 3_600_000)) {
    return NextResponse.json({ error: "That's a few requests in a row. Please try again in an hour, or email contact@learnhieroglyphics.com." }, { status: 429 });
  }

  const parsed = parseInvoiceRequest(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // A renewal names a licence: it must be one this teacher owns, or the request is refused.
  if (parsed.value.renewLicenceId) {
    const mine = await prisma.licence.findFirst({ where: { id: parsed.value.renewLicenceId, ownerUserId: user.id }, select: { id: true } });
    if (!mine) return NextResponse.json({ error: "That licence isn't on your account. Sign in as the teacher who owns it." }, { status: 400 });
  }

  const owner = {
    userId: user.id,
    email: user.email.toLowerCase(),
    gaClientId: gaClientIdFromCookie(request.cookies.get("_ga")?.value),
    gaSessionId: gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value),
  };
  const stripe = process.env.STRIPE_SECRET_KEY ? getStripe() : null;
  const outcome = await requestLicenceInvoice(stripe, parsed.value, owner);
  if (outcome.mode === "sent") {
    return NextResponse.json({
      ok: true,
      mode: "sent",
      number: outcome.invoice.number,
      hostedInvoiceUrl: outcome.invoice.hostedInvoiceUrl,
      dueDays: INVOICE_DAYS_UNTIL_DUE,
    });
  }
  return NextResponse.json({ ok: true, mode: "manual" });
}
