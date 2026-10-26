import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { looksLikeCheckoutSessionId } from "@/lib/cartouche-print";
import { checkSubscription, hasPaidAccess } from "@/lib/subscription";
import { KEYBOARD_HD, cleanText, isKeyboardStyle, isKeyboardTemplate, keyboardImageFilename, readCardParams } from "@/lib/keyboard-card";
import { renderKeyboardJpeg } from "@/lib/keyboard-image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * The HD keyboard picture (2400 × 1260, no address), two tickets:
 *   GET /api/keyboard-image/hd?session_id=cs_…        a paid keyboard-image Checkout Session (keys from its metadata)
 *   GET /api/keyboard-image/hd?m=…&s=…&g=…&l=1           a signed-in course member: included with the course
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sessionId = params.get("session_id");
  let card: ReturnType<typeof readCardParams>;

  if (sessionId) {
    if (!looksLikeCheckoutSessionId(sessionId)) return NextResponse.json({ error: "Missing purchase reference." }, { status: 400 });
    let session;
    try {
      session = await getStripe().checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.error("[keyboard-image:hd] session lookup failed:", err);
      return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
    }
    const md = session.metadata ?? {};
    if (md.product !== KEYBOARD_HD.id || session.payment_status !== "paid") {
      return NextResponse.json({ error: "This purchase is not complete." }, { status: 403 });
    }
    const spell = md.spell === "name" ? "name" : "keys";
    card = {
      typed: cleanText(md.keys ?? "", spell),
      spell,
      style: isKeyboardStyle(md.style) ? md.style : "plain",
      template: isKeyboardTemplate(md.template) ? md.template : "none",
      from: "",
      letters: md.letters === "1",
    };
  } else {
    const email = (await getServerSession(authOptions))?.user?.email;
    if (!email) return NextResponse.json({ error: "Sign in to download." }, { status: 401 });
    const access = await checkSubscription(email);
    if (!hasPaidAccess(access)) return NextResponse.json({ error: "The HD picture is included with the course." }, { status: 403 });
    card = readCardParams((k) => params.get(k));
  }
  if (card.typed.length === 0) return NextResponse.json({ error: "Nothing to draw." }, { status: 400 });

  try {
    const jpeg = await renderKeyboardJpeg(card.typed, card.style, card.template, "hd", card.spell, card.letters);
    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${keyboardImageFilename(card.typed, card.style, true)}"`,
        "Content-Length": String(jpeg.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[keyboard-image:hd] build failed:", err);
    return NextResponse.json({ error: "Could not build the picture." }, { status: 500 });
  }
}
