import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { cartouchePrintFormat, cartouchePrintFormatById, cartouchePrintName, cartouchePrintSubject, cartouchePrintTheme, isPaidCartouchePrintSession, isPhysicalCartouchePrint, looksLikeCheckoutSessionId } from "@/lib/cartouche-print";
import { buildCartouchePrintPdf } from "@/lib/cartouche-print-pdf";
import { verifyAssetSignature } from "@/lib/prodigi";

export const dynamic = "force-dynamic";

/**
 * GET /api/cartouche-print/asset?session_id=cs_…&sig=…  → page one as a PDF
 *
 * The artwork Prodigi fetches to print. The signature (src/lib/prodigi.ts)
 * is what lets an unauthenticated fetch pull a paid print, and only a paid,
 * physical order answers. Served inline, not as a download.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const sig = request.nextUrl.searchParams.get("sig");
  if (!looksLikeCheckoutSessionId(sessionId)) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }
  if (!verifyAssetSignature(sessionId, sig)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 403 });
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[cartouche-print:asset] session lookup failed:", err);
    return NextResponse.json({ error: "Unknown session" }, { status: 404 });
  }
  const name = cartouchePrintName(session);
  if (!isPaidCartouchePrintSession(session) || !isPhysicalCartouchePrint(session) || !name) {
    return NextResponse.json({ error: "Not a paid print order" }, { status: 403 });
  }

  try {
    const pdf = await buildCartouchePrintPdf(cartouchePrintSubject(session) ?? name, cartouchePrintTheme(session), { pages: "print", large: cartouchePrintFormatById(cartouchePrintFormat(session)).size !== "A4" });
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[cartouche-print:asset] build failed:", err);
    return NextResponse.json({ error: "Could not build the print." }, { status: 500 });
  }
}
