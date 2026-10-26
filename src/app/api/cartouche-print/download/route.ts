import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { cartoucheImageDownloadPath, cartouchePrintFilename, cartouchePrintName, cartouchePrintNames, cartouchePrintSubject, cartouchePrintTheme, isCartoucheImageSession, isPaidCartouchePrintSession, looksLikeCheckoutSessionId } from "@/lib/cartouche-print";
import { buildCartouchePrintPdf } from "@/lib/cartouche-print-pdf";

export const dynamic = "force-dynamic";

/**
 * GET /api/cartouche-print/download?session_id=cs_…  → the PDF
 *
 * The Checkout Session id is the ticket: unguessable, and Stripe tells us
 * whether it was paid. The PDF is rebuilt on request (it is deterministic
 * and takes well under a second), so nothing has to be stored.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!looksLikeCheckoutSessionId(sessionId)) {
    return NextResponse.json({ error: "Missing purchase reference." }, { status: 400 });
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[cartouche-print:download] session lookup failed:", err);
    return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  }

  const name = cartouchePrintName(session);
  if (!isPaidCartouchePrintSession(session) || !name) {
    return NextResponse.json({ error: "This purchase is not complete." }, { status: 403 });
  }
  // The HD image order is page one only; the three-page PDF is the dearer product.
  if (isCartoucheImageSession(session)) {
    return NextResponse.redirect(new URL(cartoucheImageDownloadPath(sessionId), request.url));
  }

  try {
    const pdf = await buildCartouchePrintPdf(cartouchePrintSubject(session) ?? name, cartouchePrintTheme(session));
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cartouchePrintFilename(cartouchePrintNames(session).join(" "))}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[cartouche-print:download] build failed:", err);
    return NextResponse.json({ error: "Could not build the print." }, { status: 500 });
  }
}
