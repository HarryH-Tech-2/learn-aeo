import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, getStripe } from "@/lib/stripe";
import { COUNTRY_COOKIE, currencyForCountry, type Currency } from "@/lib/pricing";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie } from "@/lib/ga-server";
import {
  KEYBOARD_HD,
  KEYBOARD_HD_PATH,
  cleanText,
  isKeyboardStyle,
  isKeyboardTemplate,
  keyboardRestorePath,
  keyboardStyleById,
} from "@/lib/keyboard-card";

export const dynamic = "force-dynamic";

/**
 * POST /api/keyboard-image/checkout  { keys, style, template, spell?, letters? }  → { url }
 *
 * One HD picture from the keyboard, no account needed. The keys, finish and card travel in the session
 * metadata, so the webhook's email and the download link both rebuild the same picture. An inline price
 * ($3.99 / £2.99): no catalogue Price to create in Stripe.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const spell = body?.spell === "name" ? "name" : "keys";
  const typed = cleanText(typeof body?.keys === "string" ? body.keys : "", spell);
  if (typed.length === 0) return NextResponse.json({ error: "Type something on the wall first." }, { status: 400 });
  const style = isKeyboardStyle(body?.style) ? body.style : "plain";
  const template = isKeyboardTemplate(body?.template) ? body.template : "none";
  const letters = body?.letters === true;
  const keys = typed.join("");

  try {
    const stripe = getStripe();
    const country = request.cookies.get(COUNTRY_COOKIE)?.value ?? request.headers.get("x-vercel-ip-country");
    const currency: Currency = currencyForCountry(country);

    let email: string | undefined;
    try {
      email = (await getServerSession(authOptions))?.user?.email ?? undefined;
    } catch {
      email = undefined;
    }

    const base = process.env.NEXTAUTH_URL;
    const checkout = await createCheckoutSession(stripe, {
      mode: "payment",
      ...(email ? { customer_email: email } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round((currency === "GBP" ? KEYBOARD_HD.gbp : KEYBOARD_HD.usd) * 100),
            product_data: { name: `${KEYBOARD_HD.name} · ${keyboardStyleById(style).label}`, description: KEYBOARD_HD.description },
          },
        },
      ],
      metadata: {
        product: KEYBOARD_HD.id,
        keys,
        style,
        template,
        spell,
        letters: letters ? "1" : "0",
        ga_client_id: gaClientIdFromCookie(request.cookies.get("_ga")?.value),
        ga_session_id: gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value),
      },
      payment_intent_data: { description: `${KEYBOARD_HD.name} (${keyboardStyleById(style).label}): ${keys}` },
      success_url: `${base}${KEYBOARD_HD_PATH}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${keyboardRestorePath({ typed, style, template, spell, letters }, { keep: "cancelled" })}`,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[keyboard-image:checkout] failed:", error);
    return NextResponse.json({ error: "Could not start the checkout." }, { status: 500 });
  }
}
