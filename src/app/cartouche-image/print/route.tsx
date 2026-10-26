import { NextResponse, type NextRequest } from "next/server";
import { normaliseShareName } from "@/lib/share";
import { cleanCartoucheNames, isCartouchePrintTheme } from "@/lib/cartouche-print";
import { renderCartouchePrintJpeg } from "@/lib/cartouche-print-image";

/**
 * The share image: page one of the Cartouche Print on its paper.
 *   /cartouche-image/print?name=Cleopatra&paper=night
 *
 * Runs on Node: satori draws the page, sharp re-encodes it as a JPEG of a few
 * hundred KB (src/lib/cartouche-print-image.tsx). The print-resolution copy
 * without the site's address is the paid HD image (/api/cartouche-print/image).
 */

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.getAll("name");
  // name= once is the single page, exactly as before; repeated (two to four) is a family page.
  const names = raw.length > 1 ? cleanCartoucheNames(raw) : [];
  const name = raw.length > 1 ? (names[0] ?? null) : normaliseShareName(raw[0] ?? null);
  const paper = req.nextUrl.searchParams.get("paper");
  if (!name || !isCartouchePrintTheme(paper)) {
    return NextResponse.json({ error: "name and paper are required" }, { status: 400 });
  }

  const jpeg = await renderCartouchePrintJpeg(names.length > 1 ? names : name, paper, "share");

  return new NextResponse(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      // A name on a paper always renders the same image, so let the CDN keep it.
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
    },
  });
}
