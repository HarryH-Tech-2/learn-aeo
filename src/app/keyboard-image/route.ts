import { NextResponse, type NextRequest } from "next/server";
import { readCardParams } from "@/lib/keyboard-card";
import { renderKeyboardJpeg } from "@/lib/keyboard-image";

/**
 * The keyboard's card, share size, with the site's address:
 *   /keyboard-image?m=<base64url keys>&s=night&g=birthday   (&t=n: a name, spelled as the translator spells it)
 * The free save, the secret message's link preview and the "email it to me" picture. The HD copy without
 * the address is /api/keyboard-image/hd.
 */

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { typed, style, template, spell, letters, from } = readCardParams((k) => req.nextUrl.searchParams.get(k));
  if (typed.length === 0) return NextResponse.json({ error: "m is required" }, { status: 400 });

  const jpeg = await renderKeyboardJpeg(typed, style, template, "share", spell, letters, from);
  return new NextResponse(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      // The same keys on the same finish always draw the same picture.
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
    },
  });
}
