import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { cartoucheHdImageFilename, cartouchePrintName, cartouchePrintNames, cartouchePrintSubject, cartouchePrintTheme, isPaidCartouchePrintSession, looksLikeCheckoutSessionId } from "@/lib/cartouche-print";
import { renderCartouchePrintJpeg } from "@/lib/cartouche-print-image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// A cold 300 dpi render (fonts, artwork, satori, sharp) took ~15 s on a laptop; give it room.
export const maxDuration = 30;

/**
 * GET /api/cartouche-print/image?session_id=cs_…  → the HD image (JPEG)
 *
 * Same ticket as the PDF download: the Checkout Session id, checked with
 * Stripe. Any paid Cartouche Print order may have it (a print buyer is owed
 * at least as much as an image buyer); the image is rebuilt on request.
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
    console.error("[cartouche-print:image] session lookup failed:", err);
    return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  }

  const name = cartouchePrintName(session);
  if (!isPaidCartouchePrintSession(session) || !name) {
    return NextResponse.json({ error: "This purchase is not complete." }, { status: 403 });
  }

  try {
    const theme = cartouchePrintTheme(session);
    const jpeg = await renderCartouchePrintJpeg(cartouchePrintSubject(session) ?? name, theme, "hd");
    return new NextResponse(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${cartoucheHdImageFilename(cartouchePrintNames(session).join(" "), theme)}"`,
        "Content-Length": String(jpeg.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[cartouche-print:image] build failed:", err);
    return NextResponse.json({ error: "Could not build the image." }, { status: 500 });
  }
}
