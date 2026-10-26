import { NextRequest, NextResponse } from "next/server";
import { buildClassSetPdf } from "@/lib/cartouche-print-pdf";
import { classSetFilename } from "@/lib/class-set";
import { lookUpClassSetSession } from "@/lib/class-set-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/** GET /api/class-set/download?session_id=cs_…: the bought class set, rebuilt against a paid session. */
export async function GET(request: NextRequest) {
  const purchase = await lookUpClassSetSession(request.nextUrl.searchParams.get("session_id"));
  if (!purchase.found) return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  if (!purchase.paid) return NextResponse.json({ error: "This purchase is not complete." }, { status: 403 });

  try {
    const pdf = await buildClassSetPdf(purchase.names, purchase.theme);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${classSetFilename()}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[class-set:download] build failed:", err);
    return NextResponse.json({ error: "Could not build the PDF." }, { status: 500 });
  }
}
