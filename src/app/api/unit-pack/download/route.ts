import { NextRequest, NextResponse } from "next/server";
import { buildUnitPackPdf } from "@/lib/unit-pack/pdf";
import { isPaper, unitPackFilename } from "@/lib/unit-pack/product";
import { lookUpUnitPackSession } from "@/lib/unit-pack/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/** GET /api/unit-pack/download?session_id=cs_…&paper=a4|letter: the bought unit, rebuilt against a paid session. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const purchase = await lookUpUnitPackSession(params.get("session_id"));
  if (!purchase.found) return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  if (!purchase.paid) return NextResponse.json({ error: "This purchase is not complete." }, { status: 403 });
  const asked = params.get("paper");
  const paper = isPaper(asked) ? asked : purchase.paper;

  try {
    const pdf = await buildUnitPackPdf({ paper });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${unitPackFilename(paper)}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[unit-pack:download] build failed:", err);
    return NextResponse.json({ error: "Could not build the PDF." }, { status: 500 });
  }
}
